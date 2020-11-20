import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Component, ViewEncapsulation } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';

import { ActivatedRoute, Router } from '@angular/router';

import { ActaActionService } from '../acta.action.service';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { ACTA_ROUTE_NAMES } from '../acta-route-names';
import { ActionService } from '@core/services/action-service';

const MSG_BUTTON_EDIT = marker('footer.eti.acta.actualizar');
const MSG_SUCCESS = marker('eti.acta.editar.correcto');
const MSG_ERROR = marker('eti.acta.editar.error');


@Component({
  selector: 'sgi-acta-editar',
  templateUrl: './acta-editar.component.html',
  styleUrls: ['./acta-editar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ActaActionService,
    {
      provide: ActionService,
      useExisting: ActaActionService
    }
  ]
})
export class ActaEditarComponent extends ActionComponent {
  ACTA_ROUTE_NAMES = ACTA_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_EDIT;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ActaActionService,
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