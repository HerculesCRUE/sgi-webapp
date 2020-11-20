import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { ActionService } from '@core/services/action-service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { CONVOCATORIA_REUNION_ROUTE_NAMES } from '../convocatoria-reunion-route-names';
import { ConvocatoriaReunionActionService } from '../convocatoria-reunion.action.service';

const MSG_BUTTON_EDIT = marker('botones.actualizar');
const MSG_SUCCESS = marker('eti.convocatoriaReunion.editar.correcto');
const MSG_ERROR = marker('eti.convocatoriaReunion.editar.error');

@Component({
  selector: 'sgi-convocatoria-reunion-editar',
  templateUrl: './convocatoria-reunion-editar.component.html',
  styleUrls: ['./convocatoria-reunion-editar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ConvocatoriaReunionActionService
  ]
})

export class ConvocatoriaReunionEditarComponent extends ActionComponent {
  CONVOCATORIA_REUNION_ROUTE_NAMES = CONVOCATORIA_REUNION_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_EDIT;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ConvocatoriaReunionActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }
}
