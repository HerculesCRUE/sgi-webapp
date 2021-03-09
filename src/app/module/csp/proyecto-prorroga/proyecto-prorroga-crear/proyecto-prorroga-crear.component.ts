import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { PROYECTO_PRORROGA_ROUTE_NAMES } from '../proyecto-prorroga-route-names';
import { ProyectoProrrogaActionService } from '../proyecto-prorroga.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.proyecto-prorroga.crear.correcto');
const MSG_ERROR = marker('csp.proyecto-prorroga.crear.error');

@Component({
  selector: 'sgi-proyecto-prorroga-crear',
  templateUrl: './proyecto-prorroga-crear.component.html',
  styleUrls: ['./proyecto-prorroga-crear.component.scss'],
  viewProviders: [
    ProyectoProrrogaActionService
  ]
})
export class ProyectoProrrogaCrearComponent extends ActionComponent {
  PROYECTO_PRORROGA_ROUTE_NAMES = PROYECTO_PRORROGA_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;
  private urlFrom: string;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ProyectoProrrogaActionService,
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
