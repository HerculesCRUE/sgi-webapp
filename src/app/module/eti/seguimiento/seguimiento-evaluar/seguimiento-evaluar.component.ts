import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { SeguimientoFormularioActionService } from '../../seguimiento-formulario/seguimiento-formulario.action.service';
import { SeguimientoEvaluarActionService } from '../seguimiento-evaluar.action.service';
import { SEGUIMIENTO_ROUTE_NAMES } from '../seguimiento-route-names';


const MSG_BUTTON_SAVE = marker('botones.aceptar');
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
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    route: ActivatedRoute,
    router: Router,
    public actionService: SeguimientoEvaluarActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_SAVE);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }
}
