import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { PROYECTO_SOCIO_ROUTE_NAMES } from '../proyecto-socio-route-names';
import { ProyectoSocioActionService } from '../proyecto-socio.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.proyecto-socio.crear.correcto');
const MSG_ERROR = marker('csp.proyecto-socio.crear.error');

@Component({
  selector: 'sgi-proyecto-socio-crear',
  templateUrl: './proyecto-socio-crear.component.html',
  styleUrls: ['./proyecto-socio-crear.component.scss'],
  viewProviders: [
    ProyectoSocioActionService
  ]
})
export class ProyectoSocioCrearComponent extends ActionComponent {
  PROYECTO_SOCIO_ROUTE_NAMES = PROYECTO_SOCIO_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;
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
        this.router.navigate([this.urlFrom]);
      }
    );
  }

  cancel(): void {
    this.router.navigateByUrl(this.urlFrom);
  }
}
