import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { SOLICITUD_ROUTE_NAMES } from '../solicitud-route-names';
import { SolicitudActionService } from '../solicitud.action.service';


const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.solicitud.crear.correcto');
const MSG_ERROR = marker('csp.solicitud.crear.error');

@Component({
  selector: 'sgi-solicitud-crear',
  templateUrl: './solicitud-crear.component.html',
  styleUrls: ['./solicitud-crear.component.scss'],
  viewProviders: [
    SolicitudActionService
  ]
})
export class SolicitudCrearComponent extends ActionComponent {
  SOLICITUD_ROUTE_NAMES = SOLICITUD_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public readonly actionService: SolicitudActionService,
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
        const solicitudId = this.actionService.getFragment(this.actionService.FRAGMENT.DATOS_GENERALES).getKey();
        this.router.navigate([`../${solicitudId}`], { relativeTo: this.activatedRoute });
      }
    );
  }

}
