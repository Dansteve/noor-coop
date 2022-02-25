
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable guard-for-in */
/* eslint-disable no-underscore-dangle */
// tslint:disable: no-redundant-jsdoc
// tslint:disable: variable-name
// tslint:disable:forin
// tslint:disable:max-line-length
// eslint-disable guard-for-in
// eslint-disable no-underscore-dangle
import {
  AuthReturnInfo, ErrorReturnInfo,
} from 'src/app/model/data-info';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Device, DeviceInfo, GetLanguageCodeResult } from '@capacitor/device';
import { CryptoService } from '../crypto/crypto.service';
import { AppRate } from '@awesome-cordova-plugins/app-rate/ngx';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { ScreenSizeService } from '../screen-size/screen-size.service';
import { HelperMethodsService } from '../helper-methods/helper-methods.service';

const TOKEN_DATA = 'current_user';
const CURRENT_TOKEN = 'current_token';
const PERSISTENT_USER = 'persistent_user';
const PERSISTENT_DASHBOARD = 'persistent_dashboard';
const ENABLE_FINGERPRINT = 'enable_Fingerprint';
const ENABLE_SHOW_BALANCE = 'show_Balance';
const ENABLE_DARK_MODE = 'dark_mode';
const ENABLE_PANIC_MODE = 'panic_mode';
const ENABLE_ALWAYS_LOGGED_IN_MODE = 'always_logged_in';
const NEW_RELEASE = 'new_release';
const VERSION = 'version';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  apiBaseUrl: string;
  accessToken: any = {};
  userDataState = new BehaviorSubject<any>(null);
  deviceInfo: DeviceInfo;
  deviceLanguageCodeResult: GetLanguageCodeResult;
  authenticationState = new BehaviorSubject(false);
  enableFingerprint = new BehaviorSubject(false);
  enableShowBalance = new BehaviorSubject(true);
  enableDarkMode = new BehaviorSubject(false);
  enablePanicMode = new BehaviorSubject(false);
  enableAlwaysLoggedInMode = new BehaviorSubject(false);
  isNewRelease = new BehaviorSubject(false);
  initDashboard: any = {};
  _walletBalance = new BehaviorSubject<any>({});
  _persistentDashboard = new BehaviorSubject<any>(this.initDashboard);
  version = new BehaviorSubject<string>('');
  currentVersion = environment.appVerCode;
  modalsInst = [];
  authToken = btoa(JSON.stringify(environment.apiAuthentication));
  headers: HttpHeaders = new HttpHeaders()
    .set('apiAuth', `${this.authToken}`)
    .set('Content-Type', 'text/plain')
    .set('keyId', `${environment.cryptoInfo.keyId}`);
  isDesktop: boolean;

  /**
   * Creates an instance of ApiService.
   *
   * @param platform
   * @param http
   * @param alertController
   * @param toastController
   * @memberof ApiService
   */
  constructor(
    private platform: Platform,
    private http: HttpClient,
    public alertController: AlertController,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    private storage: Storage,
    private helperMethods: HelperMethodsService,
    private screenSizeService: ScreenSizeService,
    private appRate: AppRate) {
    this.platform.ready().then(() => {
      this.apiBaseUrl = environment.apiBaseUrl;
      console.log(this.apiBaseUrl);
      this.checkToken().then(async (status) => {
        const currentState = await this.isAuthenticated();
        if (currentState) {
          this.getAuthenticatedUser().then((userDataState) => {
            this.userDataState.next(userDataState);
          });
          this.getAuthenticatedToken().then((accessToken) => {
            this.accessToken = accessToken;
          });
        }
        return false;
      });
    });
    this.getInfo();
    this.getLanguageCode();
    this.dbInit();
    this.screenSizeService.isDesktop.subscribe(isDesktop => {
      this.isDesktop = isDesktop;
    });
  }

  get persistentDashboard() {
    return this._persistentDashboard.asObservable();
  }

  get walletBalance() {
    return this._walletBalance.asObservable();
  }

  dbInit() {
    this.storage.create();
    this.storage.defineDriver(CordovaSQLiteDriver);
  }

  async getAuthHeader() {
    await this.getAuthenticatedToken();
    console.log(this.accessToken);
    return new HttpHeaders()
      .set('apiAuth', `${this.authToken || ''}`)
      .set('Content-Type', 'text/plain')
      .set('keyId', `${environment.cryptoInfo.keyId}`)
      .set('session_token', this.accessToken.sessionToken || '');
  }


  // Profile Management

  async ping(param: any): Promise<AuthReturnInfo> {
    const formData = new FormData();
    for (const i in param) {
      formData.set(i, param[i]);
    }
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user/ping')
        .subscribe(data => {
          resolve(data);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  /**
   * Store Data to local
   */
  storeApiData(res: any, data: any, name: string) {
    if (res.code === 0) {
      // if (typeof data === 'object' && data !== null) {
      //   data.a_curDate = new Date();
      // }
      return this.storeLocalData(name, data);
    }
  }

  // Storage & Utility

  async getInfo(): Promise<DeviceInfo> {
    this.deviceInfo = await Device.getInfo();
    return this.deviceInfo;
  }

  async getLanguageCode(): Promise<GetLanguageCodeResult> {
    this.deviceLanguageCodeResult = await Device.getLanguageCode();
    return this.deviceLanguageCodeResult;
  }

  async getPanicMode(): Promise<boolean> {
    return await this.storage.get(ENABLE_PANIC_MODE).then(res => {
      if (res != null) {
        return new Promise((resolve) => {
          this.enablePanicMode.next((res === 'true'));
          resolve(this.enablePanicMode.value);
        });
      } else {
        return new Promise((resolve) => {
          this.setPanicMode(false);
          resolve(false);
        });
      }
    });
  }

  async setPanicMode(enablePanicMode: boolean = !this.enablePanicMode.value): Promise<void> {
    return await this.storage.set(ENABLE_PANIC_MODE, JSON.stringify(enablePanicMode)).then(res => new Promise((resolve) => {
      this.enablePanicMode.next(enablePanicMode);
      resolve(res);
    }));
  }

  async getDarkMode(): Promise<boolean> {
    return await this.storage.get(ENABLE_DARK_MODE).then(res => {
      if (res != null) {
        return new Promise((resolve) => {
          this.enableDarkMode.next((res === 'true'));
          resolve(this.enableDarkMode.value);
        });
      } else {
        return new Promise((resolve) => {
          this.setDarkMode(false);
          resolve(false);
        });
      }
    });
  }

  async setDarkMode(enableDarkMode: boolean = !this.enableDarkMode.value): Promise<void> {
    return await this.storage.set(ENABLE_DARK_MODE, JSON.stringify(enableDarkMode)).then(res => new Promise((resolve) => {
      this.enableDarkMode.next(enableDarkMode);
      resolve(res);
    }));
  }

  async getEnableFingerprint(): Promise<boolean> {
    return await this.storage.get(ENABLE_FINGERPRINT).then(res => {
      if (res != null) {
        return new Promise((resolve) => {
          this.enableFingerprint.next((res === 'true'));
          resolve(this.enableFingerprint.value);
        });
      } else {
        return new Promise((resolve) => {
          this.setEnableFingerprint(true);
          resolve(true);
        });
      }
    });
  }

  async setEnableFingerprint(enableFingerprint: boolean = !this.enableFingerprint.value): Promise<void> {
    return await this.storage.set(ENABLE_FINGERPRINT, JSON.stringify(enableFingerprint)).then(res => new Promise((resolve) => {
      this.enableFingerprint.next(enableFingerprint);
      resolve(res);
    }));
  }

  async getShowBalance(): Promise<boolean> {
    return await this.storage.get(ENABLE_SHOW_BALANCE).then(res => {
      if (res != null) {
        return new Promise((resolve) => {
          this.enableShowBalance.next((res === 'true'));
          resolve(this.enableShowBalance.value);
        });
      } else {
        return new Promise((resolve) => {
          this.setShowBalance(true);
          resolve(true);
        });
      }
    });
  }

  async setShowBalance(enableShowBalance: boolean = !this.enableShowBalance.value): Promise<void> {
    return await this.storage.set(ENABLE_SHOW_BALANCE, JSON.stringify(enableShowBalance)).then(res => new Promise((resolve) => {
      this.enableShowBalance.next(enableShowBalance);
      resolve(res);
    }));
  }

  async getAlwaysLoggedInMode(): Promise<boolean> {
    return await this.storage.get(ENABLE_ALWAYS_LOGGED_IN_MODE).then(res => {
      if (res != null) {
        return new Promise((resolve) => {
          this.enableAlwaysLoggedInMode.next((res === 'true'));
          resolve(this.enableAlwaysLoggedInMode.value);
        });
      } else {
        return new Promise((resolve) => {
          this.setAlwaysLoggedInMode(false);
          resolve(true);
        });
      }
    });
  }

  async setAlwaysLoggedInMode(enableAlwaysLoggedInMode: boolean = !this.enableAlwaysLoggedInMode.value): Promise<void> {
    return await this.storage.set(ENABLE_ALWAYS_LOGGED_IN_MODE, JSON.stringify(enableAlwaysLoggedInMode))
      .then(res => new Promise((resolve) => {
        this.enableAlwaysLoggedInMode.next(enableAlwaysLoggedInMode);
        resolve(res);
      }));
  }

  async getNewRelease(): Promise<any> {
    return await this.storage.get(NEW_RELEASE).then(res => {
      if (res != null) {
        return new Promise((resolve) => {
          resolve(JSON.parse(res));
        });
      } else {
        return new Promise((resolve) => {
          resolve(false);
        });
      }
    });
  }

  async setNewRelease(newRelease: boolean): Promise<void> {
    return await this.storage.set(NEW_RELEASE, JSON.stringify(newRelease)).then(res => new Promise((resolve) => {
      this.isNewRelease.next(newRelease);
      resolve(res);
    }));
  }

  async getAuthenticatedUser(): Promise<any> {
    return await this.storage.get(TOKEN_DATA).then(res => {
      if (res != null) {
        return new Promise((resolve, reject) => {
          const data = JSON.parse(
            this.cryptoService.decrypt(res)
          );
          this.userDataState.next(data);
          console.log(this.userDataState.value);
          if (data.code === 1) {
            this.storage.remove(TOKEN_DATA);
            this.authenticationState.next(false);
            reject(data);
          } else {
            resolve(data);
          }
        });
      }
    });
  }

  async setAuthenticatedUser(authenticatedUser: any): Promise<void> {
    authenticatedUser.a_curDate = new Date();
    const authenticatedUserData = this.cryptoService.encrypt(JSON.stringify(authenticatedUser));
    return await this.storage.set(TOKEN_DATA, authenticatedUserData).then(res => new Promise((resolve) => {
      // this.userDataState = authenticatedUser;
      this.userDataState.next(authenticatedUser);
      resolve(res);
    }));
  }

  async getAuthenticatedToken(): Promise<any> {
    return await this.storage.get(CURRENT_TOKEN).then(res => {
      if (res != null) {
        return new Promise((resolve, reject) => {
          const data = JSON.parse(
            this.cryptoService.decrypt(res)
          );
          this.accessToken = data;
          console.log(this.accessToken);
          if (data.code === 1) {
            this.storage.remove(TOKEN_DATA);
            this.authenticationState.next(false);
            reject(data);
          } else {
            resolve(data);
          }
        });
      }
    });
  }

  async setAuthenticatedToken(authenticatedToken: any): Promise<void> {
    authenticatedToken.a_curDate = new Date();
    const authenticatedUserData = this.cryptoService.encrypt(JSON.stringify(authenticatedToken));
    return await this.storage.set(CURRENT_TOKEN, authenticatedUserData).then(res => new Promise((resolve) => {
      this.accessToken = authenticatedToken;
      resolve(res);
    }));
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.authenticationState.value;
  }

  async getPersistentDashboard(): Promise<any> {
    return await this.storage.get(PERSISTENT_DASHBOARD).then(res => {
      if (res != null) {
        return new Promise((resolve, reject) => {
          const data = JSON.parse(
            this.cryptoService.decrypt(res)
          );
          if (data.code === 1) {
            this.storage.remove(PERSISTENT_DASHBOARD);
            reject(data);
          } else {
            resolve(data);
          }
        });
      }
    });
  }

  async setPersistentDashboard(persistentDashboard: any): Promise<void> {
    persistentDashboard.a_curDate = new Date();
    const persistentDashboardData = this.cryptoService.encrypt(JSON.stringify(persistentDashboard));
    return await this.storage.set(PERSISTENT_DASHBOARD, persistentDashboardData).then(res => new Promise((resolve) => {
      this._persistentDashboard.next(persistentDashboard);
      resolve(res);
    }));
  }

  async logout(): Promise<void> {
    return await this.storage.remove(TOKEN_DATA).then(res => {
      // this.logoutUser();
      this.enableAlwaysLoggedInMode.next(false);
      this.setAlwaysLoggedInMode(false);
      this.closeAllModals();
      this.authenticationState.next(false);
    });
  }

  async storeLocalData(name: string, data: any) {
    const localData = this.cryptoService.encrypt(JSON.stringify(data));
    return this.storage.set(`local_${name}`, localData);
  }

  async getLocalData(name: string): Promise<any> {
    return await this.storage.get(`local_${name}`).then(res => new Promise((resolve, reject) => {
      if (res != null) {
        const data = JSON.parse(
          this.cryptoService.decrypt(res)
        );
        if (data.code === 1) {
          this.storage.remove(`local_${name}`);
          reject(data);
        } else {
          resolve(data);
        }
      } else {
        reject({ error: 'unable to get data', message: 'data is null' });
      }
    }));
  }

  async getAuthenticatedPersistentUser(): Promise<any> {
    return await this.storage.get(PERSISTENT_USER).then(res => {
      if (res != null) {
        return new Promise((resolve, reject) => {
          const data = JSON.parse(
            this.cryptoService.decrypt(res)
          );
          if (data.code === 1) {
            this.storage.remove(PERSISTENT_USER);
            reject(data);
          } else {
            resolve(data);
          }
        });
      }
    });
  }

  async setAuthenticatedPersistentUser(persistentUser: any): Promise<void> {
    // // console.log(PersistentUser);
    persistentUser.a_curDate = new Date();
    const persistentUserData = this.cryptoService.encrypt(JSON.stringify(persistentUser));
    return await this.storage.set(PERSISTENT_USER, persistentUserData)
      .then(res => new Promise(resolve => {
        resolve(res);
      }));
  }

  async fingerprintAIO(): Promise<void> {
    return await this.storage.get(PERSISTENT_USER).then(res => {
      if (res != null) {
        return this.storage.set(TOKEN_DATA, res).then(data => this.authenticationState.next(true));
      } else {
        return this.authenticationState.next(false);
      }
    });
  }

  async silentLogin(): Promise<void> {
    return await this.storage.get(PERSISTENT_USER).then(res => {
      if (res != null) {
        return this.storage.set(TOKEN_DATA, res).then(data => this.authenticationState.next(true));
      } else {
        return this.authenticationState.next(false);
      }
    });
  }

  async checkToken(): Promise<boolean> {
    return await this.storage.get(TOKEN_DATA).then(res => {
      if (res != null) {
        this.authenticationState.next(true);
        return true;
      } else {
        this.authenticationState.next(false);
        return false;
      }
    });
  }

  async checkCurrentToken(): Promise<boolean> {
    return await this.storage.get(CURRENT_TOKEN).then(res => {
      if (res != null) {
        this.authenticationState.next(true);
        return true;
      } else {
        this.authenticationState.next(false);
        return false;
      }
    });
  }

  async clearLocalStorage(): Promise<void> {
    return await this.storage.clear().then(res => {
      this.authenticationState.next(false);
      this.authenticationState.next(false);
    });
  }

  async errorAlert(_message: string, _header = null, img = 'info'): Promise<HTMLIonAlertElement> {
    let html = '';
    html += img ? `<img src="assets/alert/${img}.svg">` : '';
    html += _header ? `<h1 class="header ion-margin-y-12">${_header}</h1>` : '<h1></h1>';
    html += `<div class="message">${_message}</div>`;
    const alert = await this.alertController.create({
      // header: 'Status',
      // subHeader: 'Subtitle',
      cssClass: 'my-alert',
      mode: 'ios',
      message: html,
      buttons: [{
        text: 'Okay',
        role: 'cancel',
        cssClass: 'success only',
        handler: () => {
          console.log();
        }
      }],
      backdropDismiss: false
    });
    await alert.present();
    return alert;
  }

  async errorAlertWithHeader(_header: string, _message: string): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      // header: 'Status',
      header: _header,
      // subHeader: 'Subtitle',
      cssClass: 'my-alert',
      mode: 'ios',
      message: _message,
      buttons: [{
        text: 'Okay',
        role: 'cancel',
        cssClass: 'success only',
        handler: () => {
        }
      }],
      backdropDismiss: false
    });
    await alert.present();
    return alert;
  }

  async successPop(_message: string): Promise<HTMLIonToastElement> {
    const toast = await this.toastController.create({
      message: _message,
      color: 'primary',
      position: 'top',
      duration: 2000
    });
    await toast.present();
    return toast;
  }

  async successAlert(_message: string, _header = null, img: 'info' | 'success' | 'error' = 'info', buttonTitle = 'Okay'): Promise<HTMLIonAlertElement> {
    let html = '';
    html += img ? `<img src="assets/alert/${img}.svg">` : '';
    html += _header ? `<h1 class="header ion-margin-y-12">${_header}</h1>` : '<h1></h1>';
    html += `<div class="message">${_message}</div>`;
    const alert = await this.alertController.create({
      cssClass: 'my-alert',
      mode: 'ios',
      message: html,
      buttons: [
        {
          text: buttonTitle,
          role: 'cancel',
          cssClass: 'success only',
          handler: () => {
            console.log('close alert');
          }
        }
      ],
      // backdropDismiss: false
    });

    await alert.present();
    return alert;
  }

  async successAlertWithHeader(_header: string, _message: string): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: _header,
      // subHeader: 'Subtitle',
      cssClass: 'my-alert',
      mode: 'ios',
      message: _message,
      buttons: [
        {
          text: 'Okay',
          role: 'cancel',
          cssClass: 'success only',
          handler: () => {
          }
        }
      ],
      // backdropDismiss: false
    });

    await alert.present();
    return alert;
  }

  async successToast(
    _message: string,
    position: 'top' | 'bottom' | 'middle' = 'top',
    color: string = 'success', duration: number = 1000000): Promise<HTMLIonToastElement> {
    const toast = await this.toastController.create({
      message: `<div>${_message}</div>`,
      position,
      color,
      duration,
      cssClass: 'customToast',
      buttons: [
        {
          side: 'start',
          icon: 'assets/toast/success.svg',
          text: '',
          handler: () => {
            console.log('Cart Button Clicked');
          }
        }, {
          side: 'end',
          icon: 'assets/toast/close.svg',
          text: '',
          role: 'cancel',
          handler: () => {
            console.log('Close clicked');
          }
        }
      ]
    });
    await toast.present();
    return toast;
  }

  async errorToast(
    _message: string,
    position: 'top' | 'bottom' | 'middle' = 'top',
    color: string = 'danger', duration: number = 2000): Promise<HTMLIonToastElement> {
    const toast = await this.toastController.create({
      message: `<div>${_message}</div>`,
      position,
      color,
      duration,
      cssClass: 'customToast',
      buttons: [
        {
          side: 'start',
          icon: 'assets/toast/danger.svg',
          text: '',
          handler: () => {
            console.log('Cart Button Clicked');
          }
        }, {
          side: 'end',
          icon: 'assets/toast/close.svg',
          text: '',
          role: 'cancel',
          handler: () => {
            console.log('Close clicked');
          }
        }
      ]
    });
    await toast.present();
    return toast;
  }

  async comingSoon(_message: string = 'Coming Soon'): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: 'Message',
      // subHeader: 'Subtitle',
      cssClass: 'my-alert',
      mode: 'ios',
      message: _message,
      buttons: [
        {
          text: 'Okay',
          role: 'cancel',
          cssClass: 'success only',
          handler: () => {
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
    return alert;
  }

  showRatePrompt() {
    this.appRate.setPreferences({
      displayAppName: 'Microvest',
      promptAgainForEachNewVersion: true,
      // usesUntilPrompt: 5,
      storeAppURL: {
        ios: environment.appInfo.ios || '1316416568',
        android: `market://details?id=${environment.appInfo.android || 'com.farmcrowdyapp'}`
      },
      customLocale: {
        title: `How would you rate your experience?`,
        // eslint-disable-next-line max-len
        message: `If you enjoy using Microvest, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!`,
        cancelButtonLabel: 'No, Thanks',
        laterButtonLabel: 'Remind Me Later',
        rateButtonLabel: 'Rate It Now'
      }
    });
    this.appRate.promptForRating(true);
  }

  async updateToast(version: any) {
    const toast = await this.toastController.create({
      header: 'New Update available!',
      message: 'Close all tabs for the webapp to load the latest update',
      position: 'bottom',
      color: 'light',
      cssClass: 'toast web-toast',
      buttons: [{
        cssClass: 'toastReloadCancel',
        text: 'OKAY',
        role: 'Cancel',
        handler: () => {
          this.setVersion(this.currentVersion || version);
          window.location.reload();
          document.location.reload();
        }
      }
      ]
    });
    return toast.present();
  }

  // Storage & Utility
  async getVersion(): Promise<string> {
    return await this.storage.get(VERSION).then(res => {
      if (res != null) {
        return new Promise((resolve) => {
          this.version.next(res);
          resolve(res);
        });
      } else {
        return new Promise((resolve) => {
          this.setVersion(environment.appVerCode);
          resolve(environment.appVerCode);
        });
      }
    });
  }

  async setVersion(version: string = this.currentVersion): Promise<void> {
    return await this.storage.set(VERSION, (version)).then(res => new Promise((resolve) => {
      this.version.next(version);
      resolve(res);
    }));
  }

  storeModal(x: any) {
    this.modalsInst.indexOf(x) === -1 ? this.modalsInst.push(x) : (console.log('This item already exists'));
    console.log(this.modalsInst);
  }

  closeAllModals() {
    this.modalsInst.forEach(element => {
      element.dismiss();
    });
    this.modalsInst = [];
    console.log(this.modalsInst);
  }

  removeModal(x: any) {
    const index = this.modalsInst.indexOf(x);
    if (index > -1) {
      this.modalsInst[index].dismiss();
      this.modalsInst.splice(index, 1);
    }
    console.log(this.modalsInst);
  }

  convertJsonToUrlParam(obj) {
    const cleanedObj = this.helperMethods.cleanObjectData(obj);
    let str = '';
    for (const key in cleanedObj) {
      if (str !== '') {
        str += '&';
      }
      str += key + '=' + encodeURIComponent(cleanedObj[key]);
    }
    return str;
  }

}
