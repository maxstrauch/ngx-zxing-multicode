import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxZxingMulticodeComponent } from './ngx-zxing-multicode.component';

describe('NgxZxingMulticodeComponent', () => {
  let component: NgxZxingMulticodeComponent;
  let fixture: ComponentFixture<NgxZxingMulticodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxZxingMulticodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxZxingMulticodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
