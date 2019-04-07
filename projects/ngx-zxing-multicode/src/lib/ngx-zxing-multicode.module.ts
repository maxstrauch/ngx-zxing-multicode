import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxZxingMulticodeComponent } from './ngx-zxing-multicode.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [NgxZxingMulticodeComponent],
  imports: [
      CommonModule,
      FormsModule
  ],
  exports: [NgxZxingMulticodeComponent]
})
export class NgxZxingMulticodeModule { }
