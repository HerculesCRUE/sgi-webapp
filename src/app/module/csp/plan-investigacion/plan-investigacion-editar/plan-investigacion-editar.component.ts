import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { PLAN_INVESTIGACION_ROUTE_NAMES } from '../plan-investigacion-route-names';
import { PlanInvestigacionActionService } from '../plan-investigacion.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.plan.investigacion.editar.correcto');
const MSG_ERROR = marker('csp.plan.investigacion.editar.error');

@Component({
  selector: 'sgi-plan-investigacion-editar',
  templateUrl: './plan-investigacion-editar.component.html',
  styleUrls: ['./plan-investigacion-editar.component.scss'],
  viewProviders: [
    PlanInvestigacionActionService
  ]
})
export class PlanInvestigacionEditarComponent extends ActionComponent {

  PLAN_INVESTIGACION_ROUTE_NAMES = PLAN_INVESTIGACION_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    public readonly actionService: PlanInvestigacionActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.logger.debug(PlanInvestigacionEditarComponent.name, 'constructor()', 'start');
    this.logger.debug(PlanInvestigacionEditarComponent.name, 'constructor()', 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(PlanInvestigacionEditarComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
        this.logger.error(PlanInvestigacionEditarComponent.name, `${this.saveOrUpdate.name}()`, 'error');
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.route });
        this.logger.debug(PlanInvestigacionEditarComponent.name, `${this.saveOrUpdate.name}()`, 'end');
      }
    );
  }
}
