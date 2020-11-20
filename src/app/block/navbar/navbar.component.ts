import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { SelectorModuloComponent } from '../selector-modulo/selector-modulo.component';
import { MatDialog } from '@angular/material/dialog';
import { SgiAuthService } from '@sgi/framework/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sgi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(
    private logger: NGXLogger,
    public matDialog: MatDialog,
    public authService: SgiAuthService
  ) {
  }

  ngOnInit(): void {
    this.logger.debug(NavbarComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(NavbarComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Abre ventana modal para cambiar de módulo de la aplicación
   */
  selectorModulo() {
    this.logger.debug(NavbarComponent.name, 'selectorModulo()', 'start');
    const config = {
      maxWidth: '500px',
      maxHeight: '500px',
    };
    this.matDialog.open(SelectorModuloComponent, config);
    this.logger.debug(NavbarComponent.name, 'selectorModulo()', 'end');
  }
}
