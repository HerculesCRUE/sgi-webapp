import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { AREA_TEMATICA_ROUTE_NAMES } from '../area-tematica-route-names';
import { AreaTematicaActionService } from '../area-tematica.action.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.area.tematica.crear.correcto');
const MSG_ERROR = marker('csp.area.tematica.crear.error');

@Component({
  selector: 'sgi-area-tematica-crear',
  templateUrl: './area-tematica-crear.component.html',
  styleUrls: ['./area-tematica-crear.component.scss'],
  viewProviders: [
    AreaTematicaActionService
  ]
})
export class AreaTematicaCrearComponent extends ActionComponent {
  AREA_TEMATICA_ROUTE_NAMES = AREA_TEMATICA_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    public readonly actionService: AreaTematicaActionService,
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
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    );
  }

}
