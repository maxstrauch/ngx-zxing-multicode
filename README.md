<H1 align="center">
    🚧 This project has been discontinued and will not receive further updates. Please don't use it anymore. 🚧
</H1>


ngx-zxing-multicode
===

A 1D and 2D barcode scanner using HTML5 video element, built using the ZXing library. This module is _really_ usable since it solves some commen problems with `@zxing/ngx-scanner` - see _Features_.

🏁 Usage
===

Run

    npm i -s ngx-zxing-multicode

to install this package. Then include the module in your project's main module, e.g. the `AppModule`:

    @NgModule({
        ...
        imports: [
            ...
            NgxZxingMulticodeModule
        ],
        ...
    })
    export class AppModule { }

and use it in any place:

    <ngx-zxing-multicode></ngx-zxing-multicode>

API
===

    <ngx-zxing-multicode 
        [detectInterval]="100" 
        [persistence]="20" 
        [hideDeviceSelector]="true" 
        [previewFitMode]="fill
        (detect)="myFunc($event)" 
        (error)="myFunc($event)" 
        (notFound)="myFunc()"
    ></ngx-zxing-multicode>

 - `detectInterval` - interval in ms to run the recognition
 - `persistence` - the time during which the same barcode is not emitted multiple times, calculated: `detectInterval * persistence` 
 - `hideDeviceSelector` - if the device selection dropdown is shown or not (always the first device is started)
 - `previewFitMode` - by default `cover`, determines how the video fits the element. See https://developer.mozilla.org/de/docs/Web/CSS/object-fit
 - `detect` - called when a barcode is found with `ScanResult` as payload
 - `error` - called if any error occurred with `NgxZxingMulticodeError`
 - `notFound` - called on every interval cycle if no barcode is found

Event objects details:

    export interface ScanResult {
        type: string; // Type of the barcode found
        code: string; // Barcode payload
        raw: ZXing.Result; // Original object
    }    

    export enum NgxZxingMulticodeErrno {
        E_MEDIA_ACCESS = 1,
        E_NO_DEVICES = 2,
        E_NO_SUPPORT = 3,
        E_LIST_DEVICES = 4,
        E_SCAN = 5
    }

    export interface NgxZxingMulticodeError {
        code: NgxZxingMulticodeErrno;
        error?: Error; // Original error
    }


Features
===

This module has been written quickly since `@zxing/ngx-scanner` is really nice but has some serious limitations when used in a real-world scenario:

 - ✅ *Proper resource deallocation:* when the component is removed (e.g. trough `*ngIf`) it properly stops all camera access and recognition and releases the resources
 - ✅ *Scans for 1D & 2D barcodes:* this module scans for different barcodes and returns the type of barcode found and the contents of the barcode in exchange
 - ✅ *Multiple camera support:* if there are multiple cameras available a dropdown is shown which lets the user select the camera to use
 - ✅ *No console output:* the different libraries spill out a lot of `console.{log|error}` output which is a no-go for a production app. This library uses the `debug` module for logging which is turned of and can be turned on

TODOs
===

The are a lot of extensions which could be applied to this module, namely:

 - ➡ Save the selected camera in `localStorage` for next use
 - ➡ Test on different devices like iPad, iPhone, Android devices etc.