/* eslint-disable @typescript-eslint/naming-convention */
export const environment = {
  production: true,
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
