import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES } from '../solicitud-proyecto-socio-route-names';
import { SolicitudProyectoSocioActionService } from '../solicitud-proyecto-socio.action.service';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.solicitud-proyecto-socio.editar.correcto');
const MSG_ERROR = marker('csp.solicitud-proyecto-socio.editar.error');

@Component({
  selector: 'sgi-solicitud-proyecto-socio-editar',
  templateUrl: './solicitud-proyecto-socio-editar.component.html',
  styleUrls: ['./solicitud-proyecto-socio-editar.component.scss'],
  viewProviders: [
    SolicitudProyectoSocioActionService
  ]
})
export class SolicitudProyectoSocioEditarComponent extends ActionComponent {

  SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES = SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES;

  textoEditar = MSG_BUTTON_EDIT;
  urlFrom: string;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: SolicitudProyectoSocioActionService,
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
        this.router.navigateByUrl(this.urlFrom);
      }
    );
  }

  cancel(): void {
    this.router.navigateByUrl(this.urlFrom);
  }
}
