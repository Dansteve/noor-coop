import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlutterwaveService } from './flutterwave.service';
import { FlutterwaveMakePaymentComponent } from './flutterwave-make-payment/flutterwave-make-payment.component';
import { PUBLIC_KEY, IS_TEST_MODE } from './flutterwave-key';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [FlutterwaveMakePaymentComponent],
  providers: [FlutterwaveService],
  exports: [FlutterwaveMakePaymentComponent]
})
export class FlutterwaveModule {

  constructor() {
    const inlineSdk = 'https://checkout.flutterwave.com/v3.js';
    const script = document.createElement('script');
    script.src = inlineSdk;
    if (!document.querySelector(`[src="${inlineSdk}"]`)) {
      document.body.appendChild(script);
    }
  }

  static forRoot(publicKey: string, isTestMode: boolean = false): ModuleWithProviders<any> {
    return {
      ngModule: FlutterwaveModule,
      providers: [
        FlutterwaveService,
        { provide: PUBLIC_KEY, useValue: publicKey },
        { provide: IS_TEST_MODE, useValue: isTestMode },
      ]
    };
  }


}
