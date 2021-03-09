import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { EvaluacionFormularioActionService } from '../../evaluacion-formulario/evaluacion-formulario.action.service';
import { EVALUACION_ROUTE_NAMES } from '../evaluacion-route-names';
import { EvaluacionActionService } from '../evaluacion.action.service';


const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('eti.evaluacion.evaluar.correcto');
const MSG_ERROR_SAVE = marker('eti.evaluacion.evaluar.comentarios.error.crear');

@Component({
  selector: 'sgi-evaluacion-evaluar',
  templateUrl: './evaluacion-evaluar.component.html',
  styleUrls: ['./evaluacion-evaluar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [
    EvaluacionActionService,
    {
      provide: EvaluacionFormularioActionService,
      useExisting: EvaluacionActionService
    }

  ]
})
export class EvaluacionEvaluarComponent extends ActionComponent {
  EVALUACION_ROUTE_NAMES = EVALUACION_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    route: ActivatedRoute,
    router: Router,
    public actionService: EvaluacionActionService,
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
