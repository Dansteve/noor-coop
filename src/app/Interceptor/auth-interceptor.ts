import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
/* eslint-disable guard-for-in */
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiService } from '../services/api/api.service';
import { throwError } from 'rxjs';
import { NavController, Platform } from '@ionic/angular';
import { DeviceInfo } from '@capacitor/device';
import { CryptoService } from '../services/crypto/crypto.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  deviceInfo: any;
  devicePlatform: any;
  devicePlayerId = '';

  constructor(
    private api: ApiService,
    public navController: NavController,
    public router: Router,
    private platform: Platform,
    private oneSignal: OneSignal,
    public cryptoService: CryptoService) {
    this.deviceInfo = this.api.deviceInfo ? this.api.deviceInfo : {};
    console.log(this.deviceInfo);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    this.api.getLocalData('playerId').then((token) => {
      this.devicePlayerId = token?.userId;
      console.log('Push registration success in Auth : getLocalData, token: ', token);
    }).catch((err) => console.log(err));
    if (this.platform.is('capacitor')) {
      this.oneSignal.getIds().then((playerID) => {
        this.devicePlayerId = playerID.userId;
      }).catch((err) => console.log(err));
    }

    const params = new HttpParams();
    const authToken = btoa(JSON.stringify(environment.apiAuthentication));
    const authReq = req.clone({
      headers: req.headers
        .set('apiAuth', `${authToken}`)
        .set('Content-Type', 'text/plain')
        .set('keyId', `${environment.cryptoInfo.keyId}`),
    });
    return next.handle(authReq).pipe(
      catchError(this.httpHandleError)
    );
  }

  private httpHandleError(error: HttpErrorResponse) {
    let result = null;
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
      result = error.error;
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: ${JSON.stringify(
          error
        )}`
      );
      result = error.error;
      let content = null;
      if (error.error.message) {
        if ((!error.error.success && error.error.message === 'Failed validation.')
          || (!error.error.success && error.error.message === 'The given data was invalid.')
        ) {
          content = '';
          // tslint:disable-next-line:forin
          for (const i in error.error.errors) {
            content += `${error.error.errors[i]} <br>`;
          }
          // tslint:disable-next-line:forin
          for (const i in error.error.error) {
            content += `${error.error.error[i]} <br>`;
          }
          // tslint:disable-next-line:forin
          for (const i in error.error.data) {
            content += `${error.error.data[i]} <br>`;
          }
        } else if (!error.error.success) {
          content = error.error.message;
        }
        if (!error.error.success && (error.error.message.includes('resource not found')
          // || error.error.message.includes('not found')
        )) {
          content = 'We are unable to perform the operation now. Kindly try again later...';
        }
      }

      result = {
        success: false,
        title: error.error.title ? error.error.title : (error.error.message_title || 'Oops!'),
        message: content
          ? content
          : 'Sorry, we are unable to perform the operation at this time. Kindly check your internet connection and try again',
      };
    }
    console.log(result);
    return throwError(result);
  }
}
