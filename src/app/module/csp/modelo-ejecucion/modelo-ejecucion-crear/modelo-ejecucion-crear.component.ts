import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { MODELO_EJECUCION_ROUTE_NAMES } from '../modelo-ejecucion-route-names';
import { ModeloEjecucionActionService } from '../modelo-ejecucion.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.modelo.ejecucion.crear.correcto');
const MSG_ERROR = marker('csp.modelo.ejecucion.crear.error');

@Component({
  selector: 'sgi-modelo-ejecucion-crear',
  templateUrl: './modelo-ejecucion-crear.component.html',
  styleUrls: ['./modelo-ejecucion-crear.component.scss'],
  viewProviders: [
    ModeloEjecucionActionService
  ]
})

export class ModeloEjecucionCrearComponent extends ActionComponent {
  MODELO_EJECUCION_ROUTE_NAMES = MODELO_EJECUCION_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    public readonly actionService: ModeloEjecucionActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.logger.debug(ModeloEjecucionCrearComponent.name, 'constructor()', 'start');
    this.logger.debug(ModeloEjecucionCrearComponent.name, 'constructor()', 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(ModeloEjecucionCrearComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
        this.logger.error(ModeloEjecucionCrearComponent.name, `${this.saveOrUpdate.name}()`, 'error');
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.route });
        this.logger.debug(ModeloEjecucionCrearComponent.name, `${this.saveOrUpdate.name}()`, 'end');
      }
    );
  }

}
