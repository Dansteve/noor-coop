/* eslint-disable @typescript-eslint/member-ordering */
import { environment } from './../environments/environment';
import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { Platform, NavController, ModalController, AlertController } from '@ionic/angular';
import { ApiService } from './services/api/api.service';
import { ScreenSizeService } from './services/screen-size/screen-size.service';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { StatusBar as StatusBars } from '@awesome-cordova-plugins/status-bar/ngx';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { DataService } from './services/data/data.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ComponentPickerService } from './services/component-picker/component-picker.service';
import { TestDataService } from './services/test-data/test-data.service';
import { OneSignalNotificationData, UserData } from './model/data-info';
import { HelperMethodsService } from './services/helper-methods/helper-methods.service';
// import { OnesignalNotificationComponent } from './components/notification/onesignal-notification/onesignal-notification.component';
import { NetworkService } from './services/network/network.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device, DeviceInfo } from '@capacitor/device';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ConstValue } from './model/constant';
import { TabsService } from './services/tabs/tabs.service';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { OneSignal as OneSignalService } from 'onesignal-ngx';
// import { ChangesInfoComponent } from './components/common/changes-info/changes-info.component';
declare let window: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit {

  isLogin = false;
  isDesktop: boolean;
  enablePanicMode = false;
  enableAlwaysLoggedInMode = false;
  setIdleTimeOut = environment.production ? 5 * 60 : 5 * 60;
  infoData: DeviceInfo | any = {};
  url: string = null;
  isDarkMode: boolean;
  photo: any = {
    picBase64: null
  };
  currentUserData: UserData = {
    id: null,
    receiveAlertEmail: true,
    receiveAlertSms: true
  };
  currentUrl = 'home';
  constValue = ConstValue;
  iconOnly = false;
  hideTabBarPages: any = [
  ];
  routeParamPages: string[] = [
  ];
  shouldHideEmailVerify = false;

  constructor(
    private router: Router,
    private platform: Platform,
    private api: ApiService,
    private zone: NgZone,
    public modalController: ModalController,
    private helperMethods: HelperMethodsService,
    private networkService: NetworkService,
    private navController: NavController,
    private statusBar: StatusBars,
    private screenSizeService: ScreenSizeService,
    private oneSignal: OneSignal,
    private oneSignalService: OneSignalService,
    private dataService: DataService,
    public componentPickerService: ComponentPickerService,
    private idle: Idle,
    public tabsService: TabsService,
    public toastController: ToastController,
    public testDataService: TestDataService,
    private storage: Storage,
    public alertController: AlertController
  ) {
    this.api.userDataState.subscribe(data => {
      this.currentUserData = data;
      this.api.getLocalData('profilePicture').then((img) => {
        this.photo = img;
      }).catch(async (err) => console.log(err));
    });
    this.screenSizeService.isDesktop.subscribe(isDesktop => {
      if (this.isDesktop && !isDesktop) {
        // Reload because our routing is out of place
        window.location.reload();
      }
      this.isDesktop = isDesktop;
    });
    this.setIdleTimeOut = environment.production ? 5 * 60 : 5 * 60;
    this.initializeApp().then(async () => {
      await this.api.getInfo().then((data) => {
        this.infoData = data;
        console.log(this.infoData);
        // if (environment.production) {
        this.checkForUpdate();
        // }
      });
      this.initIdle();
      await this.api.checkCurrentToken().then(async () => {
        const currentState = await this.api.isAuthenticated();
        console.log(currentState);
        if (currentState) {
          this.isLogin = true;
          this.checkAlwaysLoggedInMode().then(() => {
            if (this.enableAlwaysLoggedInMode) {
              this.api.getAuthenticatedToken().then((accessToken) => {
                this.api.accessToken = accessToken;
              });
              this.api.silentLogin().then(() => {
                this.api.isAuthenticated().then(async isAuth => {
                  if (isAuth) {
                    this.navController.navigateRoot('/member/home');
                  } else {
                    this.api.errorAlert('Kindly Login Again');
                  }
                }).catch(async (err) => console.log(err));
              }).catch(async (err) => console.log(err));
            }
            // SplashScreen.hide();
          }).catch(() => {
            // SplashScreen.hide();
          });
        }
        return false;
      }).then(() => {
        // // console.log(this.islogin);
      });
      SplashScreen.hide();
    });
    this.api.getDarkMode().then((res) => {
      this.isDarkMode = res;
    });
  }

  async ngOnInit() {
    await this.storage.create();
    await this.storage.defineDriver(CordovaSQLiteDriver);
  }

  checkDarkMode() {
    this.api.getDarkMode().then((res) => {
      this.isDarkMode = res;
      document.body.classList.toggle('dark', this.isDarkMode);
      console.log(document.body.getAttribute('data-theme'));
      if (this.isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.setAttribute('data-theme', 'light');
      }
    }).catch((err) => console.log(err));
  }


  initIdle() {
    this.idle.setIdle(30);
    this.idle.setTimeout(this.setIdleTimeOut);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.router.events.subscribe(() => {
      if (this.router.url) {
        if (this.router.url === '/landing') {
          this.url = null;
        } else {
          this.url = this.router.url;
        }
      }
    });
    this.idle.onTimeoutWarning.subscribe(() => {
      // console.warn('Timeout Warning - ' + countdown);
    });

    this.idle.onTimeout.subscribe(() => {
      this.inactiveToggle();
      this.api.logout().then(() => {
        this.removeAllModals().then(() => {
          this.dataService.setData('action', 'logout');
          this.navController.navigateRoot(`login${this.url ? '?url=' + this.url : ''}`);
          this.idle.stop();
          this.idle.ngOnDestroy();
        }).catch((err) => console.log(err));
      }).catch((err) => console.log(err));
    });

    this.idle.watch();
  }

  async removeAllModals() {
    this.api.closeAllModals();
    return true;
  }

  checkForUpdate() {
    // this.api.getReleaseVersion().then((res) => {
    //   this.api.getVersion().then((data) => {
    //     console.log(res, data);
    //     console.log(data);
    //     if (data !== res.data.versionNo) {
    //       this.api.currentVersion = res.data.versionNo || environment.appVerCode;
    //       this.openChangeInfoModal();
    //     } else {
    //       this.api.setVersion(environment.appVerCode);
    //     }
    //   }).catch((err) => {
    //     console.warn(err);
    //   });
    // }).catch((err) => {
    //   console.warn(err);
    //   this.openChangeInfoModal();
    // });
  }

  async openChangeInfoModal() {
    // const modal = await this.modalController.create({
    //   component: ChangesInfoComponent,
    //   backdropDismiss: false,
    //   swipeToClose: true,
    //   animated: false,
    //   cssClass: this.helperMethods.getModalStyle2(this.screenSizeService.widthSize.value),
    // });
    // this.api.storeModal(modal);
    // await modal.present();
    // const { data } = await modal.onDidDismiss();
    // if (data) {
    //   this.api.removeModal(modal);
    //   this.api.setNewRelease(true);
    //   this.api.setVersion(environment.appVerCode);
    // }
  }

  async inactiveToggle(timer: number = 2000) {
    const toast = await this.toastController.create({
      message: 'Your have been logged out cause of inactivity.',
      duration: timer,
      color: 'light',
      cssClass: 'toast web-toast'
    });
    toast.present();
  }

  async initializeApp() {
    return await this.platform.ready().then(async () => {
      const info = await Device.getInfo();
      // console.log(info.platform);
      if (info.platform !== 'web') {
        if (info.platform === 'ios') {
          StatusBar.setStyle({ style: Style.Light });
        } else {
          this.statusBar.styleDefault();
          // // this.statusBar.overlaysWebView(true);
          this.statusBar.backgroundColorByHexString('#ffffff');
        }
        this.deepLink();
      }
      this.checkAlwaysLoggedInMode().then(() => {
        if (!this.enableAlwaysLoggedInMode) {
          // // SplashScreen.hide();
        }
      }).catch(() => {
        // // SplashScreen.hide();
      });
      this.networkService.initializeNetworkSubscription();
      this.screenSizeService.onResize(this.platform.width(), this.platform.height());
      if (info.platform !== 'web') {
        this.getOneSignal();
      } else {
        this.getOneSignalWeb();
      }
    });
  }

  deepLink() {
    App.addListener('appUrlOpen', (data: any) => {
      this.zone.run(() => {
        //// Example url: https://beerswift.app/tabs/tab2
        //// slug = /tabs/tab2
        const slug = data.url.split('.com').pop();
        if (slug) {
          // // this.router.navigateByUrl(slug);
          this.navController.navigateRoot(slug);
        }
        // // If no match, do nothing - let regular routing
        // // logic take over
      });
    });
  }


  checkAlwaysLoggedInMode() {
    return this.api.getAlwaysLoggedInMode().then((res) => {
      this.enableAlwaysLoggedInMode = res;
    }).catch((err) => console.log(err));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSizeService.onResize(event.target.innerWidth, event.target.innerHeight);
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event: any) {
    this.screenSizeService.onResize(event.target.innerWidth, event.target.innerHeight);
  }

  getOneSignal() {
    this.oneSignal.startInit(environment.onesignal.appId, environment.onesignal.googleProjectNumber);
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
    });
    this.oneSignal.handleNotificationOpened().subscribe((notificationData: any) => {
      if (!notificationData.notification.payload.additionalData
        || notificationData.notification.payload.additionalData.type === 'broadcast') {
        this.showOneSignal(notificationData);
      }
    });
    this.oneSignal.endInit();
    this.oneSignal.getIds().then((data) => {
      const param = { playerId: data.userId, ...data };
      this.api.storeLocalData('playerId', param).catch((err) => {
      });
    });
  }

  async showOneSignal(notificationData: OneSignalNotificationData) {
    // let size = 60 || 45;
    // if (notificationData.notification.payload.rawPayload.att) {
    //   size = 60 || 90;
    // }
    // const modal = await this.modalController.create({
    //   component: OnesignalNotificationComponent,
    //   backdropDismiss: false,
    //   swipeToClose: true,
    //   componentProps: {
    //     notificationData
    //   },
    //   cssClass: this.helperMethods.getModalDynamicStyle(this.screenSizeService.widthSize.value, size),
    // });
    // this.api.storeModal(modal);
    // await modal.present();
    // const { data } = await modal.onDidDismiss();
    // if (data) {
    //   this.api.removeModal(modal);
    // }
  }


  getOneSignalWeb() {
    if (environment.production) {
      this.oneSignalService.init({ appId: environment.onesignal.appId }).then(() => {
        // do other stuff
      }).catch((err) => console.log(err));
    }
  }

}
