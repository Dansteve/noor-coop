import { InjectionToken } from '@angular/core';

export const BASE_URL = 'https://api.flutterwave.com/v3';
export const INLINE_SDK = 'https://checkout.flutterwave.com/v3.js';

export const PUBLIC_KEY = new InjectionToken<string>('flutterwave.publicKey');
export const IS_TEST_MODE = new InjectionToken<boolean>('flutterwave.isTestMode');
