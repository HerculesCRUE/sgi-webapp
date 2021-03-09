import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { PROYECTO_ROUTE_NAMES } from '../proyecto-route-names';
import { ProyectoActionService } from '../proyecto.action.service';







const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.proyecto.crear.correcto');
const MSG_ERROR = marker('csp.proyecto.crear.error');


@Component({
  selector: 'sgi-proyecto-crear',
  templateUrl: './proyecto-crear.component.html',
  styleUrls: ['./proyecto-crear.component.scss'],
  providers: [
    ProyectoActionService
  ]
})
export class ProyectoCrearComponent extends ActionComponent implements OnInit {
  PROYECTO_ROUTE_NAMES = PROYECTO_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ProyectoActionService,
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
