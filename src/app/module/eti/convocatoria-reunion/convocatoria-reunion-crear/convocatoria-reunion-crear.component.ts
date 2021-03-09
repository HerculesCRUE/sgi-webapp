import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { CONVOCATORIA_REUNION_ROUTE_NAMES } from '../convocatoria-reunion-route-names';
import { ConvocatoriaReunionActionService } from '../convocatoria-reunion.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('eti.convocatoriaReunion.crear.correcto');
const MSG_ERROR = marker('eti.convocatoriaReunion.crear.error');


@Component({
  selector: 'sgi-convocatoria-reunion-crear',
  templateUrl: './convocatoria-reunion-crear.component.html',
  styleUrls: ['./convocatoria-reunion-crear.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [
    ConvocatoriaReunionActionService
  ]
})
export class ConvocatoriaReunionCrearComponent extends ActionComponent {
  CONVOCATORIA_REUNION_ROUTE_NAMES = CONVOCATORIA_REUNION_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public readonly actionService: ConvocatoriaReunionActionService,
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
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }
}
