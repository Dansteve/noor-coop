
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
  DashboardDataInfo, Customer, AuthReturnInfo, ErrorReturnInfo, OTPRequest,
} from 'src/app/model/data-info';
import { Wallet, WalletAccount } from 'src/app/model/data-info';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Device, DeviceInfo, GetLanguageCodeResult } from '@capacitor/device';
import { CryptoService } from '../crypto/crypto.service';
import { AppRate } from '@awesome-cordova-plugins/app-rate/ngx';
import { RegisterRequestPayload } from '../../model/data-info';
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

  apiBaseUrl: string | 'https://live.microvest.ng/';
  accessToken: any = {};
  userDataState = new BehaviorSubject<Customer>(null);
  deviceInfo: DeviceInfo;
  deviceLanguageCodeResult: GetLanguageCodeResult;
  authenticationState = new BehaviorSubject(false);
  enableFingerprint = new BehaviorSubject(false);
  enableShowBalance = new BehaviorSubject(true);
  enableDarkMode = new BehaviorSubject(false);
  enablePanicMode = new BehaviorSubject(false);
  enableAlwaysLoggedInMode = new BehaviorSubject(false);
  isNewRelease = new BehaviorSubject(false);
  initDashboard: DashboardDataInfo = {};
  _walletBalance = new BehaviorSubject<WalletAccount>({});
  _persistentDashboard = new BehaviorSubject<DashboardDataInfo>(this.initDashboard);
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

  async initiateRegistration(param: RegisterRequestPayload): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/registration/initiate', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async resendRegistrationOTP(param: OTPRequest): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/registration/otp', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async completeRegistration(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/registration/complete', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async login(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/login', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async userLogout(param: any = {}): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/logout', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async getUserProfile(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `user-profile`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`user-profile`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async changePassword(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/password/change', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async changeDefaultPassword(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/password/change/default', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async initiatePasswordReset(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/password/reset/initiate', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async passwordResetComplete(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    const headers = this.headers;
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/password/reset/complete', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileSettingEnableSMSAlert(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/settings/alert/sms', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileSettingEnableEmailAlert(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/settings/alert/email', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileSettingUpdatePicture(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/settings/picture', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileUpdate(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/profile/update', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileCreateNextOfKin(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/profile/nok', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileCreateSecurityQuestion(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/profile/securityquestion', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileSetupPIN(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/profile/pinsetup', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileVerifyBVN(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/verification/verifybvn', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileSettingGetPicture(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user/settings/picture', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          this.storeLocalData('profilePicture', res);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async getNextOfKinReference(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user/nok/ref', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `nok-ref`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`nok-ref`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getSecurityQuestionsReference(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user/securityquestions/ref', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `securityQuestions-ref`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`securityQuestions-ref`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async profileGetNextOfKin(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user/profile/nok', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileGetVerificationStatus(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user/verification/getstatus', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async profileGetSecurityQuestions(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/user/profile/securityquestion', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  // Wallet Service

  async fetchWalletAccount(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + '/wallet/accounts', { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this._walletBalance.next(res);
          this.storeApiData(res, data, `wallet-accounts`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`wallet-accounts}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchWalletAccountById(id: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/wallet/accounts/${id}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `wallet-accounts-${id}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`wallet-accounts-${id}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchBanks(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/user/banks`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `banks`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`banks`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async createCustomerBankAccount(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/user/bankaccount/create', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async updateCustomerBankAccount(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/user/bankaccount/${param.id}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async fetchUserBanks(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/user/bankaccounts`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `bankaccounts`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`bankaccounts`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }
  // Products Service

  async fetchAllProduct(status: any = 'ACTIVE'): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product?activeStatus=${status}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `products-${status}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`products-${status}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchProductsByType(type: any = '', activeStatus = 'ACTIVE', param: any = {}): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    const productType = type !== null ? `&productType=${type}` : '';
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product?activeStatus=${activeStatus}` + productType, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `productType-${type}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`productType-${type}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchCustomerProductsStatistics(type: any, param: any = {}): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product/customer/productstat?productType=${type}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `productstat-productType-${type}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`productstat-productType-${type}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchCustomerMiLockStatistics(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product/customer/lockedproductstat`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `lockedproductstat`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`lockedproductstat`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchProductsBalance(type: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product/customer/getProductBalance?productType=${type}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          this.setPersistentDashboard(res);
          resolve(res);
          this.storeApiData(res, data, `getProductBalance-productType-${type || 'all'}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`getProductBalance-productType-${type || 'all'}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchCustomerProducts(param: any = {}): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product/customer/get?productType=${param.productType}&productCategory=${param.productCategory}&productName=${param.productName}&activeStatus=${param.activeStatus}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `customer-product-${param.productType || 'all'}-${param.productCategory || 'all'}-${param.productName || 'all'}-${param.activeStatus || 'all'}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`customer-product-${param.productType || 'all'}-${param.productCategory || 'all'}-${param.productName || 'all'}-${param.activeStatus || 'all'}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchCustomerProductInterest(productId: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product/customer/interest/get/productId=${productId}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `customer-product-interest`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`customer-product-interest`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchCustomerTransactions(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/product/customer/transaction/get?productId=${param.productId}&startDate=${param.startDate}&endDate=${param.endDate}&transaction_type=${param.transaction_type}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `customer-transaction-${param.productId}-${param.startDate}-${param.endDate}-${param.transaction_type}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`customer-transaction-${param.productId}-${param.startDate}-${param.endDate}-${param.transaction_type}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  // Financial Service
  async productCashOut(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/finance/product/cashout', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async walletCashOut(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/finance/wallet/cashout', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async productTopup(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/finance/product/topup', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async walletTopup(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/finance/wallet/topup', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async productPurchase(param: any): Promise<any> {
    console.log(param);
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/finance/product/buy', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }


  async productUpdateStandingInstruction(param: any): Promise<any> {
    console.log(param);
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/finance/product/update/standing_instruction', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async referralEarnings(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/finance/referral/earnperreferral`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `earnperreferral`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`earnperreferral`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async referralPerformance(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/finance/referral/performance`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `performance`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`performance`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async fetchTransactionRef(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/finance/card/transactionRef?${this.convertJsonToUrlParam(param)}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `customer-transactionRef`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`customer-transactionRef`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async accountLookup(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/finance/lookup/bankaccount?${this.convertJsonToUrlParam(param)}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `customer-bankaccount-${this.convertJsonToUrlParam(param)}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`customer-bankaccount-${this.convertJsonToUrlParam(param)}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async verifyBVN(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/finance/verification/verifybvn?${this.convertJsonToUrlParam(param)}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `customer-verifybvn-${this.convertJsonToUrlParam(param)}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`customer-verifybvn-${this.convertJsonToUrlParam(param)}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async pauseSubscription(customerProductId: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload({});
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/finance/product/autodeposit/suspend/${customerProductId}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async resumeSubscription(customerProductId: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload({});
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/finance/product/autodeposit/allow/${customerProductId}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async walletLookup(customerEmailOrPhoneNumber: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload({});
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/finance/wallet/lookup?customerEmailOrPhoneNumber=${customerEmailOrPhoneNumber}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async walletTransfer(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/finance/wallet/transfer`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  // Transaction service

  async transactionTypesReference(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/transaction/getTransactionTypes`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `getTransactionTypes`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`getTransactionTypes`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async transactionHistory(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/transaction/list?${this.convertJsonToUrlParam(param)}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `customer-product-${this.convertJsonToUrlParam(param)}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`customer-product-${param.walletId}-${param.startDate}-${param.endDate}-${param.transactionType}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async frequencyTypesReference(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/transaction/getFrequencyTypes`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `getFrequencyTypes`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`getFrequencyTypes`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  // Social

  async createSocialProfile(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/social/create/profile', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async createSocialPost(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/social/create/post', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async createPostReaction(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/reaction/${param.postId}/${param.reactionType}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async createPostReplyReaction(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/reaction/${param.postId}/${param.replyId}/${param.reactionType}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async uploadPostContent(param: any, formData: FormData): Promise<any> {
    // const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/upload/${param.session_token}/${param.postId}/content/${param.type}?uploadFile`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async getSocialCategories(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/categories`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `getSocialCategories`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`getSocialCategories`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async createPostReply(param: any): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/create/post/reply`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  async getPostReplies(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/postreplies/${param.socialPostId}/${param.size}/${param.page}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `postreplies-${param.socialPostId}-${param.size}-${param.page}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`postreplies-${param.socialPostId}-${param.size}-${param.page}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getAllPosts(size: number = 10, page: number = 0, categories: number = 1,): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/posts/${categories || 1}/${size || 10}/${page || 0}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `getAllPosts-${size || 10}-${page || 1}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`getAllPosts-${size || 10}-${page || 1}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getPostReactions(socialPostId): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/userposts/reactions/${socialPostId}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `reactions${socialPostId}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`reactions${socialPostId}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getChildReplies(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `social/childreplies/${param.parentPostId}/${param.size}/${param.page}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `childreplies-${param.parentPostId}-${param.size}-${param.page}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`childreplies-${param.parentPostId}-${param.size}-${param.page}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getUserPosts(size: number = 10, page: number = 0): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/userposts/${size || 10}/${page || 0}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `getUserPosts-${size || 10}-${page || 1}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`getUserPosts-${size || 10}-${page || 1}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getPostByID(socialPostId: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/posts/${socialPostId}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `posts-${socialPostId}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`posts-${socialPostId}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getRelatedVideoPosts(param: any): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/videoposts/${param.categoryId || 0}/${param.size || 10}/${param.page || 0}`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `videoposts-${param.categoryId}-${param.size || 10}-${param.page || 0}`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`videoposts-${param.categoryId}-${param.size || 10}-${param.page || 0}`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  async getAgreement(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .get(this.apiBaseUrl + `/social/agreement/get`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
          this.storeApiData(res, data, `agreement`);
        }, (error: ErrorReturnInfo) => {
          this.getLocalData(`agreement`).then((data) => {
            const res = this.cryptoService.decryptPayload(data);
            resolve(res);
          }).catch(() => {
            reject(error);
          });
        });
    });
  }

  /**
   * Accept EULA Agreement
   */
  async acceptEULAAgreement(param: any = {}): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + '/social/agreement/accept', formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  /**
   * Report social profile
   */
  async reportSocialProfile(param: any = { reason: 'Reason goes here ...' }): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/report/profile/${param.socialProfileID}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  /**
   * Report social post
   */
  async reportSocialPost(param: any = { reason: 'Reason goes here ...' }): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/report/post/${param.postId}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  /**
   * Block social profile
   */
  async blockSocialProfile(param: any = { reason: 'Reason goes here ...' }): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/block/${param.socialProfileID}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
        }, (error: ErrorReturnInfo) => {
          reject(error);
        });
    });
  }

  /**
   * UnBlock social profile
   */
  async unblockSocialProfile(param: any = { reason: 'Reason goes here ...' }): Promise<any> {
    const formData = this.cryptoService.encryptPayload(param);
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiBaseUrl + `/social/unblock/${param.socialProfileID}`, formData, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          resolve(res);
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

  // Miscellaneous

  async getReleaseVersion(): Promise<any> {
    let headers: HttpHeaders;
    await this.getAuthHeader().then((data) => {
      headers = data;
    });
    return await new Promise((resolve, reject) => {
      this.http.get(this.apiBaseUrl + `/admin/setting/applatestversion`, { headers, responseType: 'text' })
        .subscribe((data: any) => {
          const res = this.cryptoService.decryptPayload(data);
          if (res.code === 0) {
            this.storeLocalData(`version`, res.data.versionNo);
          }
          resolve(res);
        },
          (error: ErrorReturnInfo) => {
            this.getLocalData(`version`)
              .then((data) => {
                const res = this.cryptoService.decryptPayload(data);
                resolve(res);
              })
              .catch(() => {
                reject(error);
              });
          }
        );
    });
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

  async getAuthenticatedUser(): Promise<Customer> {
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

  async updateLocalUserProfile(): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.getUserProfile().then(async (res) => {
        if (res.code === 0) {
          this.setAuthenticatedUser(res.customerDetails);
          this.setAuthenticatedPersistentUser(res.customerDetails);
          resolve(res.customerDetails);
        } else {
          reject({});
        }
      });
    });
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

  async setPersistentDashboard(persistentDashboard: DashboardDataInfo): Promise<void> {
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

  async getAuthenticatedPersistentUser(): Promise<Customer> {
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
