import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxZxingMulticodeModule } from 'projects/ngx-zxing-multicode/src/public_api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxZxingMulticodeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
