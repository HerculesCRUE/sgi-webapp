import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { APP_ROUTE_NAMES } from 'src/app/app-route-names';

@Injectable()
export class ProyectoSocioGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
    const proyectoId = this.router.getCurrentNavigation()?.extras?.state?.proyectoId;
    if (proyectoId) {
      return true;
    }
    if (this.router.navigated) {
      return false;
    }
    return this.router.navigate([APP_ROUTE_NAMES.CSP]);
  }
}
