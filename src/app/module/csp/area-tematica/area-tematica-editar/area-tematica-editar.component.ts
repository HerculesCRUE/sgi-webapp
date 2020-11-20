import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { AREA_TEMATICA_ROUTE_NAMES } from '../area-tematica-route-names';
import { AreaTematicaActionService } from '../area-tematica.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.area.tematica.editar.correcto');
const MSG_ERROR = marker('csp.area.tematica.editar.error');

@Component({
  selector: 'sgi-area-tematica-editar',
  templateUrl: './area-tematica-editar.component.html',
  styleUrls: ['./area-tematica-editar.component.scss'],
  viewProviders: [
    AreaTematicaActionService
  ]
})
export class AreaTematicaEditarComponent extends ActionComponent {

  AREA_TEMATICA_ROUTE_NAMES = AREA_TEMATICA_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    public readonly actionService: AreaTematicaActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.logger.debug(AreaTematicaEditarComponent.name, 'constructor()', 'start');
    this.logger.debug(AreaTematicaEditarComponent.name, 'constructor()', 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(AreaTematicaEditarComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
        this.logger.error(AreaTematicaEditarComponent.name, `${this.saveOrUpdate.name}()`, 'error');
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.route });
        this.logger.debug(AreaTematicaEditarComponent.name, `${this.saveOrUpdate.name}()`, 'end');
      }
    );
  }
}
