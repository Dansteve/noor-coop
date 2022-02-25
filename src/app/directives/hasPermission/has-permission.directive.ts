import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {

  @Input('appHasPermission') permissions: string[] = ['read'];
  permission = true;
  constructor(
    private api: ApiService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }


  ngOnInit(): void {
    // if user has permission
    this.api.getAuthenticatedUser().then((user) => {
      // this.permission =  user.permission.includes(this.permissions);
      if (this.permission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    }).catch((err) => {
      this.viewContainer.clear();
    });
  }
}
