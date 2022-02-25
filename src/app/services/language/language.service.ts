import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Plugins, DeviceInfo, DeviceLanguageCodeResult } from '@capacitor/core';
const { Storage, Device } = Plugins;

const LNG_KEY = 'SELECTED_LANGUAGE';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  selected = '';

  constructor(private translate: TranslateService, private plt: Platform) { }

  setInitialAppLanguage() {
    const language = this.translate.getBrowserLang();
    this.translate.setDefaultLang(language);
    Storage.get({ key: LNG_KEY }).then(res => {
      if (res.value != null) {
        const selected = (JSON.parse((
          res.value)
        ));
        this.setLanguage(selected.value);
        this.selected = selected.value;
      } else {
        this.setLanguage('en');
      }
    });
  }

  getLanguages() {
    return [
      { text: 'English', value: 'en' },
      // { text: 'Yoruba', value: 'yoruba' },
      // { text: 'Igbo', value: 'igbo' },
      // { text: 'Hausa', value: 'hausa' },
    ];
  }

  setLanguage(selectedLanguage) {
    this.translate.use(selectedLanguage.value);
    this.selected = selectedLanguage;
    Storage.set({ key: LNG_KEY, value: JSON.stringify(selectedLanguage) });
  }
}
