/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-arrow/prefer-arrow-functions */


import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgPipesModule } from 'ngx-pipes';
import { MomentModule } from 'ngx-moment';
import { FormsModule } from '@angular/forms';

import { Angular4PaystackModule } from 'angular4-paystack';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { Facebook } from '@awesome-cordova-plugins/facebook/ngx';
import { SignInWithApple } from '@awesome-cordova-plugins/sign-in-with-apple/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { AuthInterceptor } from './Interceptor/auth-interceptor';
import { ChartsModule } from 'ng2-charts';

import { AppRate } from '@awesome-cordova-plugins/app-rate/ngx';
import { ComponentPickerService } from './services/component-picker/component-picker.service';
import { IonicSelectableModule } from 'ionic-selectable';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { SharedComponentsModule } from './components/shared-components.module';
import { SharedDirectivesModule } from './directives/shared-directives.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { SharedPipeModule } from './pipes/shared-pipe.module';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';

import { Drivers, Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { FlutterwaveModule } from './flutterwave/flutterwave.module';
import { SharedCommonComponentsModule } from './components/common/shared-common-components.module';
import { SharedWalletComponentsModule } from './components/wallet/shared-home-components.module';
import { SharedItemsComponentsModule } from './components/items/shared-items-components.module';
import { SharedProfileComponentsModule } from './components/profile/shared-profile-components.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot({
      mode: 'ios',
      animated: false
    }),
    IonicStorageModule.forRoot({
      name: '__mv109DB',
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    AppRoutingModule,
    NgPipesModule,
    MomentModule,
    FormsModule,
    ChartsModule,
    SharedPipeModule,
    SharedComponentsModule,
    SharedCommonComponentsModule,
    SharedItemsComponentsModule,
    SharedDirectivesModule,
    SharedWalletComponentsModule,
    SharedProfileComponentsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 20,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300,
    }),
    NgIdleKeepaliveModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    IonicSelectableModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    Angular4PaystackModule.forRoot(environment.PayStack.publicKey),
    FlutterwaveModule.forRoot(environment.Flutterwave.publicKey),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    OneSignal,
    GooglePlus,
    Facebook,
    SignInWithApple,
    Vibration,
    PhotoViewer,
    AppRate,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // FingerprintAIO,
    ComponentPickerService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
