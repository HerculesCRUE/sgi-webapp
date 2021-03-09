import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { EVALUADOR_ROUTE_NAMES } from '../evaluador-route-names';
import { EvaluadorActionService } from '../evaluador.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('eti.evaluador.actualizar.correcto');
const MSG_ERROR = marker('eti.evaluador.actualizar.error');

@Component({
  selector: 'sgi-evaluador-editar',
  templateUrl: './evaluador-editar.component.html',
  styleUrls: ['./evaluador-editar.component.scss'],
  viewProviders: [
    EvaluadorActionService
  ]
})
export class EvaluadorEditarComponent extends ActionComponent {
  EVALUADOR_ROUTE_NAMES = EVALUADOR_ROUTE_NAMES;

  textoActualizar = MSG_BUTTON_SAVE;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: EvaluadorActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }
}
