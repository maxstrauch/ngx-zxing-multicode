import { TestBed } from '@angular/core/testing';

import { NgxZxingMulticodeService } from './ngx-zxing-multicode.service';

describe('NgxZxingMulticodeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxZxingMulticodeService = TestBed.get(NgxZxingMulticodeService);
    expect(service).toBeTruthy();
  });
});
