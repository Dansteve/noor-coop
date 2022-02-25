import { TemplateRef, ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { HasPermissionDirective } from './has-permission.directive';

describe('HasPermissionDirective', () => {
  it('should create an instance', () => {
    // tslint:disable-next-line:prefer-const
    let api: ApiService, templateRef: TemplateRef<any>, viewContainer: ViewContainerRef;
    const directive = new HasPermissionDirective(
      api, templateRef, viewContainer);
    expect(directive).toBeTruthy();
  });
});
