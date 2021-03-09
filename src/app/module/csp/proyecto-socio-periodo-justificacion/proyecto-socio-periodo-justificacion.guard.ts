import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { APP_ROUTE_NAMES } from 'src/app/app-route-names';

@Injectable({
  providedIn: 'root'
})
export class ProyectoSocioPeriodoJustificacionGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
    const periodoJustificacion = this.router.getCurrentNavigation()?.extras?.state?.periodoJustificacion;
    if (periodoJustificacion) {
      return true;
    }
    if (this.router.navigated) {
      return false;
    }
    return this.router.navigate([APP_ROUTE_NAMES.CSP]);
  }
}
