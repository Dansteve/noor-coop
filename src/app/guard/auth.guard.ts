import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivate
} from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = next.data?.role;
    return this.api.checkToken().then(() => this.api.isAuthenticated().then(currentState => {
      console.log(currentState);
      console.log(state.url);
      if (currentState) {
        return true;
      }
      this.router.navigateByUrl(`login?url=${encodeURIComponent(state.url)}`);
      return false;
    }));
  }

  canLoad(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.api.checkToken().then(() => this.api.isAuthenticated().then(currentState => {
      console.log(currentState);
      console.log(state.url);
      if (currentState) {
        return true;
      }
      this.router.navigateByUrl(`login?url=${encodeURIComponent(state.url)}`);
      return false;
    }));
  }
}


