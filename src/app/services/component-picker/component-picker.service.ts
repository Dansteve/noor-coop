/* eslint-disable max-len */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentPickerService {

  componentsList: Array<any> = [
  ];

  componentsListName = [];
  constructor() {
    this.componentsList.forEach(x => {
      this.componentsListName.push(x.prototype.getClassName());
    });
  }

  getComponent(componentName: string = '') {
    componentName = componentName.includes('Component') ? componentName : componentName + 'Component';
    let component = null;
    const index = this.componentsListName.findIndex(x => x === componentName);
    if (index !== -1) {
      component = this.componentsList[index];
    }
    return component;
  }

}
