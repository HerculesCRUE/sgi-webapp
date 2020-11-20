import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';

import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { GestionSeguimientoActionService } from '../gestion-seguimiento.action.service';
import { GESTION_SEGUIMIENTO_ROUTE_NAMES } from '../gestion-seguimiento-route-names';
import { DialogService } from '@core/services/dialog.service';
import { SeguimientoFormularioActionService } from '../../seguimiento-formulario/seguimiento-formulario.action.service';

const MSG_BUTTON_SAVE = marker('footer.eti.evaluacion.guardar');
const MSG_SUCCESS = marker('eti.evaluacion.evaluar.correcto');
const MSG_ERROR_SAVE = marker('eti.evaluacion.evaluar.comentarios.error.crear');

@Component({
  selector: 'sgi-gestion-seguimiento-evaluar',
  templateUrl: './gestion-seguimiento-evaluar.component.html',
  styleUrls: ['./gestion-seguimiento-evaluar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [
    GestionSeguimientoActionService,
    {
      provide: SeguimientoFormularioActionService,
      useExisting: GestionSeguimientoActionService
    }
  ]
})
export class GestionSeguimientoEvaluarComponent extends ActionComponent {
  GESTION_SEGUIMIENTO_ROUTE_NAMES = GESTION_SEGUIMIENTO_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    route: ActivatedRoute,
    router: Router,
    public actionService: GestionSeguimientoActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR_SAVE);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }
}
