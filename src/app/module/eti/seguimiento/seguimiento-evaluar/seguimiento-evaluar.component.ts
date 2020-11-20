import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';

import { SeguimientoEvaluarActionService } from '../seguimiento-evaluar.action.service';
import { SEGUIMIENTO_ROUTE_NAMES } from '../seguimiento-route-names';
import { SeguimientoFormularioActionService } from '../../seguimiento-formulario/seguimiento-formulario.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('eti.seguimiento.evaluar.correcto');
const MSG_ERROR_SAVE = marker('eti.seguimiento.evaluar.comentarios.error.crear');

@Component({
  selector: 'sgi-seguimiento-evaluar',
  templateUrl: './seguimiento-evaluar.component.html',
  styleUrls: ['./seguimiento-evaluar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [
    SeguimientoEvaluarActionService,
    {
      provide: SeguimientoFormularioActionService,
      useExisting: SeguimientoEvaluarActionService
    }
  ]
})
export class SeguimientoEvaluarComponent extends ActionComponent {
  SEGUIMIENTO_ROUTE_NAMES = SEGUIMIENTO_ROUTE_NAMES;
  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    route: ActivatedRoute,
    router: Router,
    public actionService: SeguimientoEvaluarActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.logger.debug(SeguimientoEvaluarComponent.name, 'constructor()', 'start');
    this.logger.debug(SeguimientoEvaluarComponent.name, 'constructor()', 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(SeguimientoEvaluarComponent.name, 'saveOrUpdate()', 'start');
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR_SAVE);
        this.logger.error(SeguimientoEvaluarComponent.name, 'saveOrUpdate()', 'error');
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        this.logger.debug(SeguimientoEvaluarComponent.name, 'saveOrUpdate()', 'end');
      }
    );
  }
}
