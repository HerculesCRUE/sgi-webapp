import { Component } from '@angular/core';
import { PROYECTO_PERIODO_SEGUIMIENTO_ROUTE_NAMES } from '../proyecto-periodo-seguimiento-route-names';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProyectoPeriodoSeguimientoActionService } from '../proyecto-periodo-seguimiento.action.service';
import { DialogService } from '@core/services/dialog.service';
import { ActionComponent } from '@core/component/action.component';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.proyecto-periodo-seguimiento.editar.correcto');
const MSG_ERROR = marker('csp.proyecto-periodo-seguimiento.editar.error');

@Component({
  selector: 'sgi-proyecto-periodo-seguimiento-editar',
  templateUrl: './proyecto-periodo-seguimiento-editar.component.html',
  styleUrls: ['./proyecto-periodo-seguimiento-editar.component.scss'],
  viewProviders: [
    ProyectoPeriodoSeguimientoActionService
  ]
})
export class ProyectoPeriodoSeguimientoEditarComponent extends ActionComponent {

  PROYECTO_PERIODO_SEGUIMIENTO_ROUTE_NAMES = PROYECTO_PERIODO_SEGUIMIENTO_ROUTE_NAMES;

  textoEditar = MSG_BUTTON_EDIT;
  private urlFrom: string;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ProyectoPeriodoSeguimientoActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.urlFrom = history.state?.from;
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
        this.returnUrl();
      }
    );
  }

  cancel(): void {
    this.returnUrl();
  }


  private returnUrl() {
    this.router.navigateByUrl(this.urlFrom);
  }
}
