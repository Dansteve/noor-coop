/* eslint-disable @angular-eslint/no-output-native */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { InlinePaymentOptions, PaymentSuccessResponse } from '../models';
import { FlutterwaveService } from '../flutterwave.service';
import { PUBLIC_KEY, IS_TEST_MODE } from '../flutterwave-key';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'angular-Flutterwave',
  templateUrl: './flutterwave-make-payment.component.html',
  styleUrls: ['./flutterwave-make-payment.component.css']
})
export class FlutterwaveMakePaymentComponent implements OnInit {

  @Input() public_key: string;
  @Input() tx_ref: string;
  @Input() amount: number;
  @Input() currency: string;
  @Input() payment_options: string;
  @Input() payment_plan: string | number;
  @Input() subaccounts: any;
  @Input() integrity_hash: any;
  @Input() redirect_url: string;
  @Input() meta: any; // { consumer_id, consumer_mac}
  @Input() customer: any; // {email, phone_number,name}
  @Output() callback: EventEmitter<PaymentSuccessResponse> = new EventEmitter<PaymentSuccessResponse>();
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Input() customizations: any; // {title, description, logo}
  @Input() text: string;
  @Input() style: any;
  @Input() className: string;
  @Input() data: InlinePaymentOptions;

  customer_defaults = {
    email: '',
    phone_number: '',
    name: '',
  };
  meta_defaults = {
    consumer_id: '',
    consumer_mac: '',
  };
  customizations_defaults = {
    title: '',
    description: '',
    logo: '',
  };
  private inlinePaymentOptions: InlinePaymentOptions;

  constructor(@Inject(PUBLIC_KEY) private publicKey: string,
    @Inject(IS_TEST_MODE) private isTestMode: boolean = false,
    private flutterwaveService: FlutterwaveService) {
  }

  ngOnInit(): void {
  }

  makePayment() {
    this.prepareForPayment();
    let errorText = this.flutterwaveService.validateInput(this.inlinePaymentOptions);
    if (errorText) {
      console.error(errorText);
      return errorText;
    }
    this.flutterwaveService.flutterwaveCheckout(this.inlinePaymentOptions);
  }

  prepareForPayment(): void {
    this.customer = this.customer || {};
    this.meta = this.meta || {};
    this.customizations = this.customizations || {};
    if (this.data) {
      this.inlinePaymentOptions = {
        ...{ public_key: this.public_key || this.publicKey },
        ...this.data,
        callback: response => {
          this.data.callbackContext[this.data.callback.name](response);
        },
        onclose: () => {
          try {
            this.data.callbackContext[this.data.onclose.name]();
          } catch (e) {
            console.log(e);
          }
        },
      };
    } else {
      this.inlinePaymentOptions = {
        callbackContext: null,
        public_key: this.public_key || this.publicKey,
        tx_ref: this.tx_ref,
        amount: this.amount,
        currency: this.currency || 'NGN',
        payment_options: this.payment_options || 'card, mobilemoney, ussd',
        redirect_url: this.redirect_url || '',
        meta: { ...this.meta_defaults, ...this.meta },
        customer: { ...this.customer_defaults, ...this.customer },
        callback: (response: PaymentSuccessResponse) => {
          this.callback.emit(response);
        },
        onclose: () => this.close.emit(),
        customizations: {
          ...this.customizations_defaults
          , ...this.customizations
        }
      };
      if (this.payment_plan) {
        this.inlinePaymentOptions.payment_plan = this.payment_plan;
      }
      if (this.subaccounts) {
        this.inlinePaymentOptions.subaccounts = this.subaccounts;
      }
      if (this.integrity_hash) {
        this.inlinePaymentOptions.integrity_hash = this.integrity_hash;
      }
    }
  }

}
