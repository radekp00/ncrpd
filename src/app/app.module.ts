import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from '@angular/common/http';

import { IonicStorageModule } from '@ionic/storage';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { Toast } from '@ionic-native/toast/ngx';
import { ModalPINPageModule } from '../app/modal-pin/modal-pin.module';
import { ModalNumberPageModule } from './modal-number/modal-number.module';
import { ToastController } from '@ionic/angular';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule,
    IonicStorageModule.forRoot(), ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ModalPINPageModule, ModalNumberPageModule],
  providers: [
    StatusBar,
    SplashScreen,
    Toast,
    ToastController,
    UniqueDeviceID,
    HTTP,
    SQLite,
    BarcodeScanner,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
