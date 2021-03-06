/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
// tslint:disable: no-redundant-jsdoc
// tslint:disable: variable-name
// tslint:disable:forin
// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import * as moment  from 'moment-timezone';
import _ from 'lodash';
import imageCompression from 'browser-image-compression';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};

@Injectable({
  providedIn: 'root'
})

export class HelperMethodsService {

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  /**
   *
   *
   * @param param
   * @returns
   * @memberof ApiService
   */
  async isJson(param: any): Promise<boolean> {
    if (
      /^[\],:{}\s]*$/.test(
        param
          .replace(/\\["\\\/bfnrtu]/g, '@')
          .replace(
            /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            ']'
          )
          .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   *
   * @param param
   * @returns
   * @memberof ApiService
   */
  getUrlEncode(param: any): string {
    return Object.keys(param)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(param[k]))
      .join('&');
  }

  /**
   *
   *
   * @param milliseconds
   * @returns
   * @memberof ApiService
   */
  sleep(milliseconds: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   *
   *
   * @param promise
   * @param [ms=20000]
   * @returns
   * @memberof ApiService
   */
  promiseTimeout(promise: Promise<any>, ms: number = 40000): Promise<any> {
    // Create a promise that rejects in <ms> milliseconds
    const timeout = new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        const error = {
          code: 1,
          result: 'error',
          error: 'Timeout',
          message: 'We are unable to perform the operation now. Kindly check your internet connection and try again later...'
        };
        reject(error);
      }, ms);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([promise, timeout]);
  }

  /**
   *
   *
   * @returns
   * @memberof ApiService
   */
  getGreeting(): string {
    const hrs = new Date().getHours();
    let greet = 'Welcome!';
    if (hrs > 1 && hrs < 6) {
      greet = 'You should be in bed';
    }
    if (hrs >= 6 && hrs < 12) {
      greet = 'Good Morning';
    }
    if (hrs === 12) {
      greet = 'Time for some lunch!';
    }
    if (hrs > 12 && hrs < 17) {
      greet = 'Good Afternoon';
    }
    if (hrs === 17) {
      greet = 'Time for some dinner!';
    }
    if (hrs > 17 && hrs <= 24) {
      greet = 'Good Evening';
    }
    return greet;
  }

  /**
   *
   *
   * @param xs
   * @param key
   * @returns
   * @memberof ApiService
   */
  groupBy(xs: Array<any>, key: string): any {
    return xs.reduce((rv, x, index) => {
      // console.log(index);
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});

  }

  /**
   *
   *
   * @param xs
   * @param key
   * @returns
   * @memberof ApiService
   */
  groupByDate(xs: Array<any>, key: string): any {
    return xs.reduce((rv, x) => {
      (rv[moment(x[key]).format('MMM YYYY')] = rv[moment(x[key]).format('MMM YYYY')] || []).push(x);
      return rv;
    }, {});
    // }, []);
  }

  /**
   *
   *
   * @param dataToGroupOn
   * @param fieldNameToGroupOn
   * @param [fieldNameForGroupName='key']
   * @param [fieldNameForChildren='value']
   * @returns
   * @memberof ApiService
   */
  fullGroupBy(dataToGroupOn: Array<any>, fieldNameToGroupOn: string, fieldNameForGroupName: string = 'key', fieldNameForChildren: string = 'value') {
    const result = _.chain(dataToGroupOn)
      .groupBy(fieldNameToGroupOn)
      .toPairs()
      .map((currentItem: any) => _.zipObject([fieldNameForGroupName, fieldNameForChildren], currentItem))
      .value();
    return result;
  }

  /**
   *
   *
   * @param dataToGroupOn
   * @param fieldNameToGroupOn
   * @param [fieldNameForGroupName='key']
   * @param [fieldNameForChildren='value']
   * @returns
   * @memberof ApiService
   */
  fullGroupByDate(dataToGroupOn: Array<any>, fieldNameToGroupOn: string, keyFormat: string = 'MMM YYYY', fieldNameForGroupName: string = 'key', fieldNameForChildren: string = 'value') {
    const result = _.chain(dataToGroupOn)
      .map((n) => {
        n['_' + fieldNameToGroupOn] = moment(n[fieldNameToGroupOn]).format(keyFormat);
        // console.log(n[fieldNameToGroupOn]);
        // console.log(n);
        return n;
      })
      .groupBy('_' + fieldNameToGroupOn)
      .toPairs()
      .map((currentItem) => _.zipObject([fieldNameForGroupName, fieldNameForChildren], currentItem))
      .value();
    return result;
  }



  /**
   *
   *
   * @param data
   * @param [format='YYYY-MM-DD']
   * @returns
   * @memberof HelperMethodsService
   */
  getDateformat(dateString: any = {}, format: string = 'YYYY-MM-DD'): string {
    return moment(dateString).format(format);
  }

  /**
   *
   *
   * @param data
   * @param [format='YYYY-MM-DD']
   * @returns
   * @memberof HelperMethodsService
   */
  getTodayDate(format: string = 'YYYY-MM-DD'): string {
    return moment({}).format(format);
  }

  /**
   *
   *
   * @param dateString
   * @param [format='YYYY-MM-DD']
   * @returns
   * @memberof HelperMethodsService
   */
  convertApiDateToMoment(dateString: string, format: string = 'YYYY-MM-DD'): moment.Moment {
    let returnDate = moment().tz('Africa/Lagos');
    if (moment(dateString, format).isValid()) {
      returnDate = moment(dateString, format);
    } else if (moment(dateString).isValid()) {
      returnDate = moment(dateString);
    } else {
      returnDate = moment(dateString, format);
    }
    return returnDate;
  }

  /**
   *
   *
   * @param fromString
   * @param toString
   * @param [format='days']
   * @returns
   * @memberof HelperMethodsService
   */
  getDateDiff(fromString: string, toString: string, format: moment.unitOfTime.Diff = 'days'): number {
    const a = moment(fromString);
    const b = moment(toString);
    const returnDate = b.diff(a, format, true);
    return returnDate >= 0 ? returnDate : 0;
  }

  /**
   *
   *
   * @param fromString
   * @param amount
   * @param [unit='days']
   * @param [format='YYYY-MM-DD']
   * @returns
   * @memberof HelperMethodsService
   */
  getDateAdd(fromString: string, amount: number, unit: moment.unitOfTime.Diff = 'days', format: string = 'YYYY-MM-DD'): string {
    return moment(fromString).add(amount, unit).format(format);
  }
  /**
   *
   *
   * @param fromString
   * @param amount
   * @param [unit='days']
   * @param [format='YYYY-MM-DD']
   * @returns
   * @memberof HelperMethodsService
   */
  getDateSubtract(fromString: string, amount: number, unit: moment.unitOfTime.Diff = 'days', format: string = 'YYYY-MM-DD'): string {
    return moment(fromString).subtract(amount, unit).format(format);
  }

  /**
   *
   *
   * @param of
   * @param from
   * @returns
   * @memberof HelperMethodsService
   */
  getPercent(of: number, from: number): number {
    let per = 100;
    if (of > from) {
      per = 100;
    } else if (from === 0) {
      per = 100;
    } else {
      per = (of / from) * 100;
    }
    per = parseFloat(per.toFixed(1));
    return Math.abs(per);
  }

  /**
   *
   *
   * @param res
   * @returns
   * @memberof HelperMethodsService
   */
  async getCompletionDateRange(res: any) {
    res.data.forEach((element: any) => {
      const SD = this.convertApiDateToMoment(element.startDate || element.startDate, 'Do MMM. YYYY').format('YYYY-MM-DD');
      const ED = this.convertApiDateToMoment(element.endDate || element.endDate, 'Do MMM. YYYY').format('YYYY-MM-DD');
      const TD = this.getTodayDate();
      const fromDiff = this.getDateDiff(SD, ED);
      const toDiff = this.getDateDiff(SD, TD);
      // console.log(toDiff, fromDiff, toDiff / fromDiff);
      element.fromDiff = fromDiff;
      element.toDiff = toDiff;
      if (element.status && element.status !== 'Paid') {
        element.range = (element.status.toLocaleLowerCase() === 'active' || element.status.toLocaleLowerCase() === 'locked') ? this.getPercent(toDiff, fromDiff) : 100;
        element.remaining = 100 - element.range;
      } else {
        element.range = this.getPercent(toDiff, fromDiff);
        element.remaining = 100 - element.range;
      }
    });
    return res;
  }

  /**
   *
   *
   * @param of
   * @param from
   * @returns
   * @memberof HelperMethodsService
   */
  getCompletionRange(of: string, from: string, status: string = ''): number {
    const a = parseFloat(of.split(',').join(''));
    const b = parseFloat(from.split(',').join(''));
    let per = 100;
    if (a > b) {
      per = 100;
    } else if (b === 0) {
      per = 100;
    } else {
      per = (a / b) * 100;
    }
    per = parseFloat(per.toFixed(1));
    console.log(status);
    return (status.toLocaleLowerCase() === 'active' || status.toLocaleLowerCase() === 'locked') ? Math.abs(per) : 0;
  }

  /**
   *
   *
   * @param email
   * @returns
   * @memberof HelperMethodsService
   */
  emailMask(email: string): string {
    console.log(email);
    if (email !== null || email !== undefined) {
      const maskedEmail = email ? email.replace(/([^@\.])/g, '*').split('') : [''];
      // console.log(maskedEmail);
      let previous = '';
      for (let i = 0; i < maskedEmail.length; i++) {
        if (i <= 2 || previous === '.' || previous === '@') {
          maskedEmail[i] = email ? email[i] : '';
        }
        previous = email ? email[i] : '';
      }
      // console.log(maskedEmail.join(''));
      return maskedEmail.join('');
    } else {
      return '';
    }
  }

  /**
   *
   *
   * @param a
   * @returns
   * @memberof HelperMethodsService
   */
  payStackCharge(input: any): number {
    const cap = 2000;
    const rate = 0.015;
    const flat_rate = 100;
    const a = parseFloat(input.toString().split(',').join(''));
    let charge: number;
    if (a < 2500) {
      charge = ((a) / (1 - rate)) - a;
    } else {
      charge = ((a + flat_rate) / (1 - rate)) - a;
    }
    if (charge > 2000) {
      charge = cap;
    }
    return parseFloat(charge.toFixed(2));
  }


  public blobToFile(theBlob: Blob, fileName: string, type = ''): File {
    const file = new File([theBlob], fileName, { lastModified: new Date().getTime(), type });
    return file;
  }

  async compressImage(imageFile) {
    try {
      const compressedFile = await imageCompression(imageFile, options);
      console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
      console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
      return compressedFile;
    } catch (error) {
      console.log(error.message);
      return imageFile;
    }
  }

  b64toBlob(b64Data: any, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async resolveBase64(file): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (typeof (file) === 'string') {
        resolve(file);
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = error => {
          const err = 'Error: ' + error;
          reject(err);
        };
      }
    });
  }



  formatAmount(amount: string, prefix: string = '???') {
    const x = parseFloat(amount.split(',').join(''));
    return prefix + new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(x);
  }

  getModalStyle2(width: number) {
    if (width <= 568) {
      return 'customModal4';
    } else if (width >= 568 && width <= 1024) {
      return 'customModal-full';
    } else {
      // return 'customModal-web';
      return 'customModal-normal';
    }
  }


  getModalStyle(width: number) {
    if (width <= 768) {
      return 'customModal-full';
    } else {
      // return 'customModal-web';
      return 'customModal-normal';
    }
  }


  getModalDynamicStyle(width: number, dynamicHeight: string | number = '50') {
    if (width <= 568) {
      return `customModal-${dynamicHeight}`;
    } else if (width >= 568 && width <= 1024) {
      return 'customModal-full';
    } else {
      // return 'customModal-web';
      return 'customModal-normal';
    }
  }

  getModalStyleFull(width: number) {
    if (width <= 768) {
      return 'customModal-full';
    } else {
      // return 'customModal-web';
      return 'customModal-normal';
    }
  }


  getModalStyle3(width: number) {
    if (width <= 568) {
      return 'customModal-half';
    } else {
      // return 'customModal-web';
      return 'customModal-normal';
    }
  }

  getStatData(res: string | number) {
    if (res === '0') {
      res = '0.00';
    }
    res = (res + '').split(',').join('');
    return ({
      value: parseInt(res ? (res + '').split('.')[0] : '0', 10),
      decimal: res && (res + '').split('.')[1] ? (res + '').split('.')[1] : '00',
      raw: res
    });
  }

  cleanObjectData(obj: any) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
        delete obj[propName];
      }
    }
    return obj;
  }

  getToday() {
    const d = new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }

  checkIfImageExist(url) {
    let isValid = false;
    return fetch(`${url}`).then((data) => {
      isValid = data.ok;
      return isValid;
    }).catch((err) => {
      console.log(err);
      isValid = false;
      return isValid;
    });
  }

  async getSanitizeImageUrl(url: string) {
    let validURL: any = environment.defaultImageUrl;
    await this.checkIfImageExist(url).then((data) => {
      validURL = data ? this.sanitizer.bypassSecurityTrustUrl(`${url}`) : environment.defaultImageUrl;
    }).catch(() => {
      validURL = environment.defaultImageUrl;
    });
    return validURL;
  }

  async getExternalImage(link: any, defaultImageUrl = null) {
    let validURL = '';
    if (link !== null) {
    await  this.getSanitizeImageUrl(link).then((data) => {
        validURL = data;
      }).catch(() => {
        validURL = defaultImageUrl || environment.defaultImageUrl;
      });
    } else {
      validURL = defaultImageUrl || environment.defaultImageUrl;
    }
    return validURL;
  }
}
