import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { MODELO_EJECUCION_ROUTE_NAMES } from '../modelo-ejecucion-route-names';
import { ModeloEjecucionActionService } from '../modelo-ejecucion.action.service';


const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.modelo.ejecucion.editar.correcto');
const MSG_ERROR = marker('csp.modelo.ejecucion.editar.error');

@Component({
  selector: 'sgi-modelo-ejecucion-editar',
  templateUrl: './modelo-ejecucion-editar.component.html',
  styleUrls: ['./modelo-ejecucion-editar.component.scss'],
  providers: [
    ModeloEjecucionActionService
  ]
})
export class ModeloEjecucionEditarComponent extends ActionComponent {

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
    this.logger.debug(ModeloEjecucionEditarComponent.name, 'constructor()', 'start');
    this.logger.debug(ModeloEjecucionEditarComponent.name, 'constructor()', 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(ModeloEjecucionEditarComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
        this.logger.error(ModeloEjecucionEditarComponent.name, `${this.saveOrUpdate.name}()`, 'error');
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.route });
        this.logger.debug(ModeloEjecucionEditarComponent.name, `${this.saveOrUpdate.name}()`, 'end');
      }
    );
  }
}
