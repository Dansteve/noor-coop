import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';

@Directive({
  selector: '[appEnableRole]'
})
export class EnableRoleDirective implements AfterViewInit{

  @Input() enableForRole: string | number;

  constructor(
    private api: ApiService,
    private render: Renderer2,
    private element: ElementRef
  ) { }

  ngAfterViewInit(): void {
    this.api.getAuthenticatedUser().then((user) => {
      if (user.role_id !== this.enableForRole) {
        this.render.setStyle(this.element.nativeElement, 'opacity', '0.3');
        this.render.setStyle(this.element.nativeElement, 'pointer-event', 'none');
      }
    }).catch((err) => {
    });
  }

}
