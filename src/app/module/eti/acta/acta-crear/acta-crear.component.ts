import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';


import { ActaActionService } from '../acta.action.service';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { ACTA_ROUTE_NAMES } from '../acta-route-names';


const MSG_BUTTON_SAVE = marker('footer.eti.acta.guardar');
const MSG_SUCCESS = marker('eti.acta.crear.correcto');
const MSG_ERROR = marker('eti.acta.crear.error');

@Component({
  selector: 'sgi-acta-crear',
  templateUrl: './acta-crear.component.html',
  styleUrls: ['./acta-crear.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [
    ActaActionService
  ]
})
export class ActaCrearComponent extends ActionComponent {
  ACTA_ROUTE_NAMES = ACTA_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;


  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public readonly actionService: ActaActionService,
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
