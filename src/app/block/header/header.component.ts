import { Component, OnDestroy } from '@angular/core';
import { LayoutService } from '@core/services/layout.service';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { Module } from '@core/module';

@Component({
  selector: 'sgi-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  Module = Module;
  anchoPantalla: number;

  module: Module;
  private subscription: Subscription;

  constructor(
    private readonly logger: NGXLogger,
    private readonly layout: LayoutService
  ) {
    this.anchoPantalla = window.innerWidth;
    this.subscription = this.layout.activeModule$.subscribe((res) => this.module = res);
  }

  ngOnDestroy(): void {
    this.logger.debug(HeaderComponent.name, 'ngOnDestroy()', 'start');
    this.subscription.unsubscribe();
    this.logger.debug(HeaderComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Cambiar el estado del menú acordeón
   */
  toggleSidenav(): void {
    this.logger.debug(HeaderComponent.name, 'toggleSidenav()', 'start');
    this.layout.toggleMenu();
    this.logger.debug(HeaderComponent.name, 'toggleSidenav()', 'end');
  }
}
