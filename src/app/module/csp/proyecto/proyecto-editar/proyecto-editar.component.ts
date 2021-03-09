import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { PROYECTO_ROUTE_NAMES } from '../proyecto-route-names';
import { ProyectoActionService } from '../proyecto.action.service';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.proyecto.editar.correcto');
const MSG_ERROR = marker('csp.proyecto.editar.error');

@Component({
  selector: 'sgi-proyecto-editar',
  templateUrl: './proyecto-editar.component.html',
  styleUrls: ['./proyecto-editar.component.scss'],
  viewProviders: [
    ProyectoActionService
  ]
})
export class ProyectoEditarComponent extends ActionComponent implements OnInit {
  PROYECTO_ROUTE_NAMES = PROYECTO_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_EDIT;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ProyectoActionService,
    dialogService: DialogService) {
    super(router, route, actionService, dialogService);
  }

  ngOnInit(): void {
    super.ngOnInit();
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
