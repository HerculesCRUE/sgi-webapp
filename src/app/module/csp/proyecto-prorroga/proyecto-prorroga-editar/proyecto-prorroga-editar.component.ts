import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { PROYECTO_PRORROGA_ROUTE_NAMES } from '../proyecto-prorroga-route-names';
import { ProyectoProrrogaActionService } from '../proyecto-prorroga.action.service';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.proyecto-prorroga.editar.correcto');
const MSG_ERROR = marker('csp.proyecto-prorroga.editar.error');

@Component({
  selector: 'sgi-proyecto-prorroga-editar',
  templateUrl: './proyecto-prorroga-editar.component.html',
  styleUrls: ['./proyecto-prorroga-editar.component.scss'],
  viewProviders: [
    ProyectoProrrogaActionService
  ]
})
export class ProyectoProrrogaEditarComponent extends ActionComponent {

  PROYECTO_PRORROGA_ROUTE_NAMES = PROYECTO_PRORROGA_ROUTE_NAMES;

  textoEditar = MSG_BUTTON_EDIT;
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
