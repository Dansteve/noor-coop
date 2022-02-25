import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoArrowDirective } from './no-arrow/no-arrow.directive';
import { DisableRoleDirective } from './disableRole/disable-role.directive';
import { HasPermissionDirective } from './hasPermission/has-permission.directive';
import { EnableRoleDirective } from './enableRole/enable-role.directive';



@NgModule({
  declarations: [NoArrowDirective, DisableRoleDirective, HasPermissionDirective, EnableRoleDirective],
  imports: [
    CommonModule
  ],
  exports: [NoArrowDirective, DisableRoleDirective, HasPermissionDirective, EnableRoleDirective]
})
export class SharedDirectivesModule { }
