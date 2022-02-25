/* eslint-disable @typescript-eslint/naming-convention */
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  isPwa: true,
  cryptoInfo: {
    keyId: 'test',
    salt: '4321',
    keySize: 256,
    iterations: 23,
    keys: 'UbfKIjpofcgPrFAgk46P+hNM/Hs=',
    iv: '12345678909876541234567890987654',
  },
  appVerCode: '0.0.1',
  imageUrl: '',
  dashboardUrl: '',
  TAndC: '',
  // apiBaseUrl:'',
  apiBaseUrl: '',
  defaultImageUrl: 'assets/img/avatar.svg',
  apiAuthentication: {
    userName:'',
    userPassword: '',
  },
  PayStack: {
    // publicKey: '',
    publicKey: '',
  },
  Flutterwave: {
    // publicKey: '',
    publicKey: '',
  },
  appInfo: {
    ios: '',
    android: 'com.noorcoop.app'
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },
  onesignal: {
    appId: '',
    googleProjectNumber: '',
  },
  socialCredential: {
    FACEBOOK_CLIENT_ID: '',
    FACEBOOK_CLIENT_SECRET: '',
    LINKEDIN_CLIENT_ID: '',
    LINKEDIN_CLIENT_SECRET: '',
    GOOGLE: {
      WEB: {
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: '',
      },
      ANDROID: {
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: '',
      },
      IOS: {
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: '',
      }
    }
  },
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
