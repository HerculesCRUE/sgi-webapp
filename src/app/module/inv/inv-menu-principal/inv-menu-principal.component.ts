import { Component, OnDestroy } from '@angular/core';
import { LayoutService } from '@core/services/layout.service';
import { Subscription } from 'rxjs';
import { INV_ROUTE_NAMES } from '../inv-route-names';

@Component({
  selector: 'sgi-inv-menu-principal',
  templateUrl: './inv-menu-principal.component.html',
  styleUrls: ['./inv-menu-principal.component.scss']
})
export class InvMenuPrincipalComponent implements OnDestroy {

  INV_ROUTE_NAMES = INV_ROUTE_NAMES;

  opened: boolean;
  panelDesplegado: boolean;

  private subcription: Subscription;

  constructor(
    private layout: LayoutService) {
    this.subcription = this.layout.menuOpened$.subscribe((val) => this.opened = val);
  }

  /**
   * Activamos el acordeon del elemento para poder hacerle
   * un stopProgation para que el servicio al encoger menu lo cierre
   * @param $event evento lanzado
   */
  activarAcordeon($event): void {
    if (this.opened) {
      this.panelDesplegado = this.panelDesplegado;
    } else {
      this.panelDesplegado = !this.panelDesplegado;
    }
    $event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.subcription.unsubscribe();
  }

}
