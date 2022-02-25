/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Payment data object
 *
 * @typedef {Object}
 * @property public_key {String}
 * @property callbackContext {Object}  The context of the
 * component or service that has the callback method.
 * The value must always be 'this'.
 * Using any other value might lead to error.
 * @property tx_ref {String}
 * @property amount {Number}
 * @property currency {String}
 * @property payment_options {String}
 * @property payment_plan {String}
 * @property redirect_url {String}
 * @property meta {Object}
 * @property customer {Object}
 * @property customizations {Object}
 * @property callback {Function}
 * @property onclose {Function}
 */
class InlinePaymentOptions {
  public_key: string;
  callbackContext?: any;
  tx_ref: string;
  amount: number;
  currency?: string;
  country?: string;
  authorization?: any | string;
  payment_options?: string;
  payment_plan?: string | number;
  subaccounts?: any;
  integrity_hash?: any;
  redirect_url?: string;
  meta?: any;
  customer?: any;
  customizations?: any;
  callback?: (response: any) => void;
  onclose?: () => void;
}


/**
 * Async Payment data object
 *
 * @typedef {Object}
 * @property public_key {String}
 * @property tx_ref {String}
 * @property amount {Number}
 * @property currency {String}
 * @property payment_options {String}
 * @property meta {Object}
 * @property customer {Object}
 * @property customizations {Object}
 * @property payment_plan {String}
 */
class AsyncPaymentOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency?: string;
  country?: string;
  authorization?: any | string;
  payment_options?: string;
  meta?: any;
  customer?: any;
  customizations?: any;
  payment_plan?: string | number;
  subaccounts?: any;
  integrity_hash?: any;
  [key: string]: any;
}

/**
 * Payment Response
 *
 * @typedef {Object}
 * @property amount {String}
 * @property currency {Number}
 * @property customer {Object}
 * @property flw_ref {String}
 * @property status {String}
 * @property transaction_id {String}
 * @property tx_ref {String}
 * @property payment_plan {String}
 */
class PaymentSuccessResponse {
  amount?: number;
  currency?: string;
  customer?: any;
  flw_ref?: string;
  status?: string;
  transaction_id?: number;
  tx_ref?: string;
  payment_plan?: string | number;
}


export {
  InlinePaymentOptions,
  AsyncPaymentOptions,
  PaymentSuccessResponse
};
