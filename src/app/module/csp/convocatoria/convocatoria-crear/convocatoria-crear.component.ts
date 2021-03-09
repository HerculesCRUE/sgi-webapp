import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { CONVOCATORIA_ROUTE_NAMES } from '../convocatoria-route-names';
import { ConvocatoriaActionService } from '../convocatoria.action.service';







const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_BUTTON_REGISTRAR = marker('csp.convocatoria.registrar');
const MSG_SUCCESS = marker('csp.convocatoria.crear.correcto');
const MSG_ERROR = marker('csp.convocatoria.crear.error');


@Component({
  selector: 'sgi-convocatoria-crear',
  templateUrl: './convocatoria-crear.component.html',
  styleUrls: ['./convocatoria-crear.component.scss'],
  providers: [
    ConvocatoriaActionService
  ]
})
export class ConvocatoriaCrearComponent extends ActionComponent implements OnInit {
  CONVOCATORIA_ROUTE_NAMES = CONVOCATORIA_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;
  textoRegistrar = MSG_BUTTON_REGISTRAR;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ConvocatoriaActionService,
    dialogService: DialogService) {

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
