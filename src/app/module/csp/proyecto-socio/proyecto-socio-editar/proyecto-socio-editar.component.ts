import { Component } from '@angular/core';
import { PROYECTO_SOCIO_ROUTE_NAMES } from '../proyecto-socio-route-names';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProyectoSocioActionService } from '../proyecto-socio.action.service';
import { DialogService } from '@core/services/dialog.service';
import { ActionComponent } from '@core/component/action.component';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.proyecto-socio.editar.correcto');
const MSG_ERROR = marker('csp.proyecto-socio.editar.error');

@Component({
  selector: 'sgi-proyecto-socio-editar',
  templateUrl: './proyecto-socio-editar.component.html',
  styleUrls: ['./proyecto-socio-editar.component.scss'],
  viewProviders: [
    ProyectoSocioActionService
  ]
})
export class ProyectoSocioEditarComponent extends ActionComponent {

  PROYECTO_SOCIO_ROUTE_NAMES = PROYECTO_SOCIO_ROUTE_NAMES;

  textoEditar = MSG_BUTTON_EDIT;
  urlFrom: string;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ProyectoSocioActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.urlFrom = history.state?.urlProyecto;
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
