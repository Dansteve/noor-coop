/* eslint-disable @typescript-eslint/naming-convention */
// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import firebase from 'firebase/app';
import 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform, AlertController, NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Facebook } from '@ionic-native/facebook/ngx';
import { HelperMethodsService } from '../helper-methods/helper-methods.service';
import { ApiService } from '../api/api.service';
import { AuthReturnInfo, ErrorReturnInfo } from 'src/app/model/data-info';
import { SignInWithApple, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';


@Injectable({
  providedIn: 'root',
})
export class SocialLoginService {

  supportedPopupSignInMethods = [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  ];

  sampleData = {
    name: 'Dansteve Adekanbi',
    email: 'danstevea@gmail.com',
    img: 'https://lh3.googleusercontent.com/a-/AOh14GidVr3udvSy1bXwJL1gy30wSWAHB8djqEILStjNfQ',
    socialImageUrl: 'https://lh3.googleusercontent.com/a-/AOh14GidVr3udvSy1bXwJL1gy30wSWAHB8djqEILStjNfQ',
    user_id: '113509978150567621089',
    provider: 'Google',
  };


  constructor(
    private googlePlus: GooglePlus,
    private signInWithApple: SignInWithApple,
    private fb: Facebook,
    private api: ApiService,
    private afAuth: AngularFireAuth,
    public alertController: AlertController,
    public navController: NavController,
    private platform: Platform,
    private helperMethods: HelperMethodsService
  ) { }

  getProvider(providerId) {
    switch (providerId) {
      case firebase.auth.GoogleAuthProvider.PROVIDER_ID:
        return new firebase.auth.GoogleAuthProvider();
      case firebase.auth.FacebookAuthProvider.PROVIDER_ID:
        return new firebase.auth.FacebookAuthProvider();
      case firebase.auth.TwitterAuthProvider.PROVIDER_ID:
        return new firebase.auth.TwitterAuthProvider();
      default:
        throw new Error(`No provider implemented for ${providerId}`);
    }
  }

  async doGoogleLogin(info = null) {
    if (this.platform.is('cordova')) {
      return this.nativeGoogleLogin(info);
    } else {
      return this.webGoogleLogin(info);
    }
  }

  async nativeGoogleLogin(info: any = null) {
    try {
      let params: any;
      if (this.platform.is('android')) {
        params = {
          // remember: remeber to user webClientId not android
          webClientId: environment.socialCredential.GOOGLE.WEB.GOOGLE_CLIENT_ID
            ? environment.socialCredential.GOOGLE.WEB.GOOGLE_CLIENT_ID
            : '',
          offline: true,
          scopes: 'profile email'
        };
      } else if (this.platform.is('ios')) {
        params = {
          webClientId: environment.socialCredential.GOOGLE.IOS.GOOGLE_CLIENT_ID
            ? environment.socialCredential.GOOGLE.IOS.GOOGLE_CLIENT_ID
            : '',
          offline: true,
          scopes: 'profile email'
        };
      } else {
        params = {};
      }
      console.log(params);
      const googlePlusUser = await this.googlePlus.login(params);
      console.log(googlePlusUser);
      const { idToken, accessToken } = googlePlusUser;
      const credentialLogin = accessToken
        ? firebase.auth.GoogleAuthProvider.credential(idToken, accessToken)
        : firebase.auth.GoogleAuthProvider.credential(idToken);
      const credential = await this.afAuth.signInWithCredential(
        credentialLogin
      );
      const data = {
        isNewUser: credential.additionalUserInfo.isNewUser,
        profile: credential.additionalUserInfo.profile,
        providerId: credential.additionalUserInfo.providerId,
        username: credential.additionalUserInfo.username ? credential.additionalUserInfo.username : '',
      };
      if (info) {
        console.log(info);
        credential.user.linkWithCredential(info.credential);
      }
      return this.doLogin(data);
    } catch (err) {
      err.status = false;
      console.log(err);
      if (err.email && err.code === 'auth/account-exists-with-different-credential') {
        this.linkAccount(err);
      } else {
        return err;
      }
    }
  }

  async webGoogleLogin(info: any = null) {
    try {
      const provider = new firebase.auth.GoogleAuthProvider().addScope('profile email');
      const credential = await this.afAuth.signInWithPopup(provider);
      const data = {
        isNewUser: credential.additionalUserInfo.isNewUser,
        profile: credential.additionalUserInfo.profile,
        providerId: credential.additionalUserInfo.providerId,
        username: credential.additionalUserInfo.username ? credential.additionalUserInfo.username : '',
      };
      if (info) {
        console.log(info);
        credential.user.linkWithCredential(info.credential);
      }

      console.log(credential);
      return this.doLogin(data);
    } catch (err) {
      err.status = false;
      console.log(err);
      if (err.email && err.code === 'auth/account-exists-with-different-credential') {
        this.linkAccount(err);
      } else {
        return err;
      }
    }
  }

  async doFacebookLogin(info: any = null) {
    if (this.platform.is('cordova')) {
      return this.nativeFacebookLogin(info);
    } else {
      return this.webFacebookLogin(info);
    }
  }

  async nativeFacebookLogin(info: any = null) {
    try {
      const facebookUser = await this.fb.login(['public_profile', 'user_friends', 'email']);
      console.log(facebookUser);
      const { authResponse } = facebookUser;
      const credentialLogin = authResponse
        ? firebase.auth.FacebookAuthProvider.credential(authResponse.accessToken)
        : firebase.auth.FacebookAuthProvider.credential(authResponse.accessToken);
      const credential = await this.afAuth.signInWithCredential(
        credentialLogin
      );
      console.log(credential);
      const data = {
        isNewUser: credential.additionalUserInfo.isNewUser,
        profile: credential.additionalUserInfo.profile,
        providerId: credential.additionalUserInfo.providerId,
        username: credential.additionalUserInfo.username ? credential.additionalUserInfo.username : '',
      };
      if (info) {
        console.log(info);
        credential.user.linkWithCredential(info.credential);
      }
      if (credential) {
        return this.doLogin(data);
      }
    } catch (err) {
      err.status = false;
      console.log(err);
      if (err.email && err.code === 'auth/account-exists-with-different-credential') {
        this.linkAccount(err);
      } else {
        return err;
      }
    }
  }

  async doLogin(response: any) {
    const imageUrl = (((response.providerId + '').replace('.com', '') === 'facebook')
      || (response.providerId + '').replace('.com', '') === 'apple') ?
      '' :
      response.profile.picture;
    const data = {
      name: response.profile.name ? response.profile.name : response.displayName,
      email: response.profile.email,
      imageUrl,
      username: response.profile.username ? response.profile.username : response.profile.email,
      user_id: response.profile.id ? response.profile.id : response.profile.sub,
      id: response.profile.id ? response.profile.id : response.profile.sub,
      providerId: response.providerId,
      provider: (response.providerId + '').replace('.com', '')
    };

    if (response.displayName) {
      data.name = response.displayName;
    }
    console.log(data);
    console.log(response);
    try {
      const res = await this.helperMethods.promiseTimeout(this.api.socialLogin(data), 60000);
      this.signOut();
      return res;
    } catch (err) {
      this.signOut();
      return err;
    }
  }

  async nativeAppleLogin(info: any = null) {
    try {
      const provider = new firebase.auth.OAuthProvider('apple.com');
      const param = {
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
        ]
      };
      const appleAuthRequestResponse = await this.signInWithApple.signin(param);
      console.log(appleAuthRequestResponse);
      const { identityToken, fullName, authorizationCode } = appleAuthRequestResponse;
      const displayName = fullName.givenName + ' ' + fullName.familyName;
      const credentialLogin = identityToken
        ? provider.credential(identityToken)
        : provider.credential(identityToken, authorizationCode);
      const credential = await this.afAuth.signInWithCredential(
        credentialLogin
      );
      const data = {
        isNewUser: credential.additionalUserInfo.isNewUser,
        profile: credential.additionalUserInfo.profile,
        providerId: credential.additionalUserInfo.providerId,
        username: credential.additionalUserInfo.username ? credential.additionalUserInfo.username : '',
        displayName
      };
      if (info) {
        console.log(info);
        credential.user.linkWithCredential(info.credential);
      }
      console.log(credential.additionalUserInfo);
      return this.doLogin(data);
    } catch (err) {
      err.status = false;
      console.log(err);
      if (err.email && err.code === 'auth/account-exists-with-different-credential') {
        this.linkAccount(err);
      } else {
        return err;
      }
    }
  }

  async getProfile() {
    let user = null;
    await this.helperMethods.promiseTimeout(this.api.getUserProfile())
      .then(async (res: AuthReturnInfo) => {
        if (res.success) {
          this.api.setAuthenticatedUser(res.data.user);
          this.api.setAuthenticatedPersistentUser(res.data.user);
          user = res.data.user;
        } else {
          // await loading.dismiss();
        }
      })
      .catch(async (err: ErrorReturnInfo) => {
        console.log(err);
        // await loading.dismiss();
      });
    return user;
  }

  async linkAccount(err) {
    try {
      const providers = await firebase.auth().fetchSignInMethodsForEmail(err.email);
      const firstPopupProviderMethod = providers.find(p => this.supportedPopupSignInMethods.includes(p));
      console.log(firstPopupProviderMethod);
      if (firstPopupProviderMethod === ('google.com')) {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Sign-in via Google',
          message: `Looks like you previously signed in via Google. You'll need to sign-in there to continue`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Confirm Cancel: blah');
              }
            }, {
              text: 'Continue',
              handler: () => {
                this.doGoogleLogin(err);
              }
            }
          ]
        });
        await alert.present();
      } else if (firstPopupProviderMethod === ('facebook.com')) {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Sign-in via Google',
          message: `Looks like you previously signed in via Google. You'll need to sign-in there to continue`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Confirm Cancel: blah');
              }
            }, {
              text: 'Continue',
              handler: () => {
                this.doFacebookLogin(err);
              }
            }
          ]
        });
        await alert.present();
      } else if (firstPopupProviderMethod === ('twitter.com')) {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Sign-in via Google',
          message: `Looks like you previously signed in via Google. You'll need to sign-in there to continue`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Confirm Cancel: blah');
              }
            }, {
              text: 'Continue',
              handler: () => {
                this.doTwitterLogin(err);
              }
            }
          ]
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Login Error',
          subHeader: 'Sign in using a different provider',
          // message: 'This is an alert message.',
          buttons: ['OK']
        });
        await alert.present();
      }
      return;
    } catch (error) {
      console.log(error);
    }
  }

  async webFacebookLogin(info: any = null) {
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);
      const data = {
        isNewUser: credential.additionalUserInfo.isNewUser,
        profile: credential.additionalUserInfo.profile,
        providerId: credential.additionalUserInfo.providerId,
        username: credential.additionalUserInfo.username ? credential.additionalUserInfo.username : '',
      };
      if (info) {
        console.log(info);
        credential.user.linkWithCredential(info.credential);
      }
      return this.doLogin(data);
    } catch (err) {
      err.status = false;
      console.log(err);
      if (err.email && err.code === 'auth/account-exists-with-different-credential') {
        this.linkAccount(err);
      } else {
        return err;
      }
    }
  }

  async doTwitterLogin(info: any = null) {
    if (this.platform.is('cordova')) {
      // return this.nativeTwitterLogin(info);
      return this.webTwitterLogin(info);
    } else {
      return this.webTwitterLogin(info);
    }
  }

  async webTwitterLogin(info: any = null) {
    try {
      const provider = new firebase.auth.TwitterAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);
      const data = {
        isNewUser: credential.additionalUserInfo.isNewUser,
        profile: credential.additionalUserInfo.profile,
        providerId: credential.additionalUserInfo.providerId,
        username: credential.additionalUserInfo.username ? credential.additionalUserInfo.username : '',
      };
      if (info) {
        console.log(info);
        credential.user.linkWithCredential(info.credential);
      }

      return this.doLogin(data);
    } catch (err) {
      console.log(err);
    }
  }

  async signOut() {
    this.afAuth.signOut();
  }

}
