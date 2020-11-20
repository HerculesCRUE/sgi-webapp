import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { ActionService } from '@core/services/action-service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';

import { PETICION_EVALUACION_ROUTE_NAMES } from '../peticion-evaluacion-route-names';
import { PeticionEvaluacionActionService } from '../peticion-evaluacion.action.service';

const MSG_BUTTON_EDIT = marker('footer.eti.peticionEvaluacion.actualizar');
const MSG_SUCCESS = marker('eti.peticionEvaluacion.editar.correcto');
const MSG_ERROR = marker('eti.peticionEvaluacion.editar.error');


@Component({
  selector: 'sgi-peticion-evaluacion-editar',
  templateUrl: './peticion-evaluacion-editar.component.html',
  styleUrls: ['./peticion-evaluacion-editar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeticionEvaluacionActionService,
    {
      provide: ActionService,
      useExisting: PeticionEvaluacionActionService
    }
  ]
})
export class PeticionEvaluacionEditarComponent extends ActionComponent {
  PETICION_EVALUACION_ROUTE_NAMES = PETICION_EVALUACION_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_EDIT;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: PeticionEvaluacionActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }

}
