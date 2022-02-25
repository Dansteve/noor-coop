/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { ApiService } from '../../services/api/api.service';

@Directive({
  selector: '[appDisableRole]'
})
export class DisableRoleDirective implements AfterViewInit{

  @Input() disableForRole: string | number;

  constructor(
    private api: ApiService,
    private render: Renderer2,
    private element: ElementRef
  ) { }

  ngAfterViewInit(): void {
    this.api.getAuthenticatedUser().then((user) => {
      if (user.role_id === this.disableForRole) {
        this.render.setStyle(this.element.nativeElement, 'opacity', '0.3');
        this.render.setStyle(this.element.nativeElement, 'pointer-event', 'none');
      }
    }).catch((err) => {
    });
  }

}
