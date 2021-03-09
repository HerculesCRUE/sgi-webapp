import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { SOLICITUD_PROYECTO_PRESUPUESTO_ROUTE_NAMES } from '../solicitud-proyecto-presupuesto-route-names';
import { SolicitudProyectoPresupuestoActionService } from '../solicitud-proyecto-presupuesto.action.service';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.solicitud-proyecto-presupuesto.crear.correcto');
const MSG_ERROR = marker('csp.solicitud-proyecto-presupuesto.crear.error');

@Component({
  selector: 'sgi-solicitud-proyecto-presupuesto-editar',
  templateUrl: './solicitud-proyecto-presupuesto-editar.component.html',
  styleUrls: ['./solicitud-proyecto-presupuesto-editar.component.scss'],
  viewProviders: [
    SolicitudProyectoPresupuestoActionService
  ]
})
export class SolicitudProyectoPresupuestoEditarComponent extends ActionComponent {
  SOLICITUD_PROYECTO_PRESUPUESTO_ROUTE_NAMES = SOLICITUD_PROYECTO_PRESUPUESTO_ROUTE_NAMES;

  textoEditar = MSG_BUTTON_EDIT;
  urlFrom: string;

  constructor(
    protected logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: SolicitudProyectoPresupuestoActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.urlFrom = history.state?.from;
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
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
