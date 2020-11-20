import { Component, OnDestroy } from '@angular/core';
import { LayoutService } from '@core/services/layout.service';
import { CSP_ROUTE_NAMES } from '../csp-route-names';
import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-csp-menu-principal',
  templateUrl: './csp-menu-principal.component.html',
  styleUrls: ['./csp-menu-principal.component.scss']
})
export class CspMenuPrincipalComponent implements OnDestroy {
  CSP_ROUTE_NAMES = CSP_ROUTE_NAMES;

  opened: boolean;
  panelDesplegado: boolean;

  private subcription: Subscription;

  constructor(
    protected readonly logger: NGXLogger,
    public layout: LayoutService) {
    this.subcription = this.layout.menuOpened$.subscribe((val) => this.opened = val);
  }

  /**
   * Activamos el acordeon del elemento para poder hacerle
   * un stopProgation para que el servicio al encoger menu lo cierre
   * @param $event evento lanzado
   */
  activarAcordeon($event): void {
    this.logger.debug(CspMenuPrincipalComponent.name, 'activarAcordeon($event)', 'start');
    if (this.opened) {
      this.panelDesplegado = this.panelDesplegado;
    } else {
      this.panelDesplegado = !this.panelDesplegado;
    }
    $event.stopPropagation();
    this.logger.debug(CspMenuPrincipalComponent.name, 'activarAcordeon($event)', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(CspMenuPrincipalComponent.name, 'ngOnDestroy()', 'start');
    this.subcription.unsubscribe();
    this.logger.debug(CspMenuPrincipalComponent.name, 'ngOnDestroy()', 'end');
  }

}
