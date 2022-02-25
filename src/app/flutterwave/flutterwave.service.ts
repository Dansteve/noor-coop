/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable } from '@angular/core';
import { INLINE_SDK, IS_TEST_MODE, PUBLIC_KEY } from './flutterwave-key';
import { AsyncPaymentOptions, InlinePaymentOptions, PaymentSuccessResponse } from './models';

interface MyWindow extends Window {
  FlutterwaveCheckout: any;
}
declare let window: MyWindow;

@Injectable({
  providedIn: 'root'
})

export class FlutterwaveService {

  constructor(@Inject(PUBLIC_KEY) private publicKey: string,
    @Inject(IS_TEST_MODE) private isTestMode: boolean = false) {
    this.loadScript();
  }

  loadScript(): Promise<void> {
    return new Promise(resolve => {
      if (window.FlutterwaveCheckout && typeof window.FlutterwaveCheckout === 'function') {
        resolve();
        return;
      }
      const script = window.document.createElement('script');
      window.document.head.appendChild(script);
      const onLoadFunc = () => {
        script.removeEventListener('load', onLoadFunc);
        resolve();
      };
      script.addEventListener('load', onLoadFunc);
      if (this.isTestMode) {
        script.setAttribute('src', INLINE_SDK);
      } else {
        script.setAttribute('src', INLINE_SDK);
      }
      console.log('Flutterwave Sricpt loaded');
    });
  }

  validateInput(obj: any) {
    return this.checkInput(obj);
  }

  checkInput(obj: Partial<AsyncPaymentOptions | InlinePaymentOptions>): string {
    if (!obj.public_key && !this.publicKey) {
      return 'ANGULAR-Flutterway: Please insert a your public_key';
    }
    if (!obj.amount) {
      return 'ANGULAR-Flutterway: Flutterway amount cannot be empty';
    }
    if (!obj.tx_ref) {
      return 'ANGULAR-Flutterway: Flutterway reference cannot be empty';
    }
    return '';
  }

  clean(obj: InlinePaymentOptions | AsyncPaymentOptions) {
    // tslint:disable-next-line:prefer-const
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

  getFlutterwayOptions(obj: InlinePaymentOptions | AsyncPaymentOptions): InlinePaymentOptions | AsyncPaymentOptions {
    return this.clean(obj);
  }

  public inlinePay(paymentData: InlinePaymentOptions) {
    const data = {
      ...{ public_key: this.publicKey },
      ...paymentData,
      callback: (response) => {
        paymentData.callbackContext[paymentData.callback.name](response);
      },
      onclose: () => {
        try {
          paymentData.callbackContext[paymentData.onclose.name]();
        } catch (e) { }
      },
    };
    const errorText = this.validateInput(paymentData);
    if (errorText) {
      console.error(errorText);
      return errorText;
    }
    this.flutterwaveCheckout(data);
  }

  public asyncInlinePay(paymentData: Partial<AsyncPaymentOptions>): Promise<PaymentSuccessResponse | 'closed'> {
    return new Promise((resolve, reject) => {
      paymentData = {
        ...{ public_key: this.publicKey },
        ...paymentData,
        callback: ($event) => {
          resolve($event);
        },
        onclose: () => resolve('closed'),
      };
      const errorText = this.validateInput(paymentData);
      if (errorText) {
        console.error(errorText);
        return errorText;
      }
      this.flutterwaveCheckout(paymentData);
    });

  }

  /**
   *
   * @param waitDuration {Number} Seconds before closing payment modal
   */
  public closePaymentModal(waitDuration: number = 0) {
    setTimeout(() => {
      document.getElementsByName('checkout')[0].setAttribute('style',
        'position:fixed;top:0;left:0;z-index:-1;border:none;opacity:0;pointer-events:none;width:100%;height:100%;');
      document.body.style.overflow = '';
      // document.getElementsByName('checkout')[0].setAttribute('style', 'z-index: -1; opacity: 0')
    }, waitDuration * 1000);
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  flutterwaveCheckout(data: Partial<InlinePaymentOptions | AsyncPaymentOptions>) {
    console.log(window);
    const payment = new window.FlutterwaveCheckout(data);
  };


}
