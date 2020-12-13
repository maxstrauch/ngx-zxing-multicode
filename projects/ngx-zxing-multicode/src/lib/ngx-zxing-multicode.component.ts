import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { HTMLCanvasElementLuminanceSource } from '@zxing/library/esm5/browser/HTMLCanvasElementLuminanceSource';
import BinaryBitmap from '@zxing/library/esm5/core/BinaryBitmap';
import HybridBinarizer from '@zxing/library/esm5/core/common/HybridBinarizer';
import { DecodeHintType, Result, BarcodeFormat, MultiFormatReader, BrowserQRCodeReader } from '@zxing/library';
import { VideoInputDevice } from '@zxing/library';
import debug from 'debug';

const logger = debug('ngx-zxing-multicode');

export enum NgxZxingMulticodeErrno {
    E_MEDIA_ACCESS = 1,
    E_NO_DEVICES = 2,
    E_NO_SUPPORT = 3,
    E_LIST_DEVICES = 4,
    E_SCAN = 5
}

export interface ScanResult {
    type: string;
    code: string;
    raw: Result;
}

declare var document: HTMLDocument;

const DETECT_INTERVAL = 500; // ms
const PERSISTENCE = 20; // Times the interval until the same barcode is detected as new

@Component({
    selector: 'ngx-zxing-multicode',
    templateUrl: './ngx-zxing-multicode.component.html',
    styleUrls: ['./ngx-zxing-multicode.component.scss']
})
export class NgxZxingMulticodeComponent implements OnInit, OnDestroy {

    private canvas: HTMLCanvasElement;
    private video: HTMLVideoElement;
    private stream: MediaStream;
    private reader: MultiFormatReader;
    private codeReader: BrowserQRCodeReader; 
    private intervalHandle: number;

    devices: VideoInputDevice[] = [];
    selectedDevice: VideoInputDevice;

    private lastCode: string | null = null;
    private lastCodeExp: number;

    @Input() detectInterval: number;
    @Input() persistence: number;
    @Input() hideDeviceSelector: boolean;
    @Input() previewFitMode: string = 'cover';

    /**
     * <ngx-zxing-multicode (detect)="yourHandler($event)"></ngx-zxing-multicode>
     * is called with an object { type, code } containing the type of the barcode
     * and the textual payload itself
     */
    @Output() detect = new EventEmitter<any>();

    @Output() error = new EventEmitter<any>();

    @Output() notFound = new EventEmitter<any>();

    constructor() {
        this.detectInterval = this.detectInterval || DETECT_INTERVAL;
        this.persistence = this.persistence || PERSISTENCE;
        logger(`Construct with: detectInterval=${this.detectInterval}, persistence=${this.persistence}`);
        this.init();
    }

    ngOnInit() {
        this.codeReader
            .getVideoInputDevices()
            .then(videoInputDevices => {
                this.devices = videoInputDevices;

                if (!videoInputDevices || videoInputDevices.length < 1) {
                    logger('No media devices found!');
                    this.error.emit({
                        code: NgxZxingMulticodeErrno.E_NO_DEVICES,
                        error: null
                    });
                }

                // If there is only one device, select it ...
                if (videoInputDevices.length > 0) {
                    this.selectedDevice = videoInputDevices[0];
                    this.start();
                }
            })
            .catch((error) => {
                logger('Cannot list media devices:', error);
                this.error.emit({
                    code: NgxZxingMulticodeErrno.E_LIST_DEVICES,
                    error
                });
            });
    }

    ngOnDestroy() {
        this.stop();

        // Remove the canvas
        document.body.removeChild(this.canvas);
    }

    stop() {
        // Stop the detection interval
        clearInterval(this.intervalHandle);

        // Stop the readers
        if (this.reader) {
            this.reader.reset();
        }
        if (this.codeReader) {
            this.codeReader.reset();
        }

        // Stop all active video streams
        if (this.stream) {
            const tracks = this.stream.getTracks();
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
        }

        // Remove the event listener
        if (this.video) {
            this.video.removeEventListener('playing', this.videoPlayListener.bind(this));
        }
    }

    onDeviceSelected(event: Event) {
        this.stop();
        this.start();
    }

    private async findBarCode() {
        try {
            // Grab the current screen
            this.canvas.getContext('2d').drawImage(this.video, 0, 0);

            const luminanceSource = new HTMLCanvasElementLuminanceSource(this.canvas);
            const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
            try {
                const result: Result = this.reader.decode(binaryBitmap as any);
                if (result && result.getText()) {
                    this.handleScanResult(result);
                }
            } catch (ex) {
                // This will fail regularly, because every not recognized image (empty)
                // generates a new exception
                this.notFound.emit({});
            }
        } catch (error) {
            logger('Failed to scan for barcode:', error);
            this.error.emit({
                code: NgxZxingMulticodeErrno.E_SCAN,
                error
            });
        }
    }

    private videoPlayListener() {
        this.intervalHandle = setInterval(this.findBarCode.bind(this), this.detectInterval) as any as number;
    }

    private start() {
        const _that = this;
        _that.video = document.getElementById('video') as HTMLVideoElement;

        // For iOS
        _that.video.setAttribute('autoplay', 'true');
        _that.video.setAttribute('muted', 'true');
        _that.video.setAttribute('playsinline', 'true');
        _that.video.setAttribute('autofocus', 'true');

        if (!navigator.mediaDevices) {
            logger('Browser does not support mediaDevices');
            this.error.emit({
                code: NgxZxingMulticodeErrno.E_NO_SUPPORT,
                error: null
            });
            return;
        }

        navigator
            .mediaDevices
            .getUserMedia({ video: { deviceId: { exact: this.selectedDevice.deviceId } } })
            .then((stream: MediaStream) => {
                _that.stream = stream;
                _that.video.srcObject = stream;
                _that.video.addEventListener('playing', _that.videoPlayListener.bind(_that));
                _that.video.play();
            })
            .catch((error) => {
                logger('Failed to get media: access to stream denied!', error);
                this.error.emit({
                    code: NgxZxingMulticodeErrno.E_MEDIA_ACCESS,
                    error
                });
            });
    }

    private init() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.display = 'none';
        this.canvas.width = 640;
        this.canvas.height = 480;
        document.body.appendChild(this.canvas);

        const hints = new Map();
        const formats = [
            BarcodeFormat.AZTEC, 
            BarcodeFormat.CODABAR, 
            BarcodeFormat.CODE_39, 
            BarcodeFormat.CODE_93, 
            BarcodeFormat.CODE_128, 
            BarcodeFormat.DATA_MATRIX, 
            BarcodeFormat.EAN_8, 
            BarcodeFormat.EAN_13, 
            BarcodeFormat.ITF, 
            BarcodeFormat.MAXICODE, 
            BarcodeFormat.PDF_417, 
            BarcodeFormat.QR_CODE, 
            BarcodeFormat.RSS_14, 
            BarcodeFormat.RSS_EXPANDED, 
            BarcodeFormat.UPC_A, 
            BarcodeFormat.UPC_E, 
            BarcodeFormat.UPC_EAN_EXTENSION
        ];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
         
        this.reader = new MultiFormatReader();
        this.reader.setHints(hints);

        this.codeReader = new BrowserQRCodeReader(); 
    }

    handleScanResult(event: Result) {
        const code = event.getText();

        if (code === this.lastCode && Date.now() < this.lastCodeExp) {
            return; // Still ignore ...
        }
        this.lastCode = code;
        this.lastCodeExp = Date.now() + this.persistence * this.detectInterval;

        const allFormats = [
            'AZTEC', 'CODABAR', 'CODE_39', 'CODE_93', 'CODE_128', 'DATA_MATRIX', 'EAN_8',
            'EAN_13', 'ITF', 'MAXICODE', 'PDF_417', 'QR_CODE', 'RSS_14', 'RSS_EXPANDED',
            'UPC_A', 'UPC_E', 'UPC_EAN_EXTENSION'
        ];

        const result: ScanResult = { 
            type: allFormats[event.getBarcodeFormat() % allFormats.length], 
            code,
            raw: event
        };

        logger(`Found barcode:`, result);
        this.detect.emit(result);
    }

}
