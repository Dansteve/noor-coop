import { Injectable } from '@angular/core';
import { OSNotificationOpenedResult } from '@awesome-cordova-plugins/onesignal/ngx';
import { OneSignalNotificationData } from '../../model/data-info';

@Injectable({
  providedIn: 'root',
})
export class TestDataService {

  notifications: OneSignalNotificationData | OSNotificationOpenedResult | any = {
    notification: {
      shown: true,
      payload: {
        rawPayload: {
          aps: {
            alert: {
              subtitle: 'Dansteve ',
              title: 'Refer & Earn Up To ₦1,000',
              body:
                'Udemy offers fun and engaging content on a wide variety of topics - from development and stress management to marketing and strategy. With Udemy, you can learn on-demand whenever you want. Don\'t miss out on all the great courses to choose from!',
            },
            'mutable-content': 1,
            sound: 'default',
          },
          att: {
            id:
              'https://www.linkpicture.com/q/Refer-Earn-Updated-Newsletter-2.svg',
          },
          custom: { a: {}, i: '9f73d3e7-aaa6-4bb8-85a1-bedc16800f83' },
        },
        additionalData: {},
        subtitle: 'Dansteve ',
        title: 'Refer & Earn Up To ₦1,000',
        sound: 'default',
        body:
          'Udemy offers fun and engaging content on a wide variety of topics - from development and stress management to marketing and strategy. With Udemy, you can learn on-demand whenever you want. Don\'t miss out on all the great courses to choose from!',
        notificationID: '9f73d3e7-aaa6-4bb8-85a1-bedc16800f83',
        actionButtons: [],
      },
      isAppInFocus: true,
      displayType: 1,
    },
    action: {},
  };

  constructor() { }

  async getNotifications() {
    return this.notifications;
  }
}
