import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DialogService } from '@core/services/dialog.service';
import { MemoriaActionService } from '../memoria.action.service';

import { MEMORIA_ROUTE_NAMES } from '../memoria-route-names';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('eti.memoria.crear.correcto');
const MSG_ERROR = marker('eti.memoria.crear.error');

@Component({
  selector: 'sgi-memoria-crear',
  templateUrl: './memoria-crear.component.html',
  styleUrls: ['./memoria-crear.component.scss'],
  viewProviders: [
    MemoriaActionService
  ]
})
export class MemoriaCrearComponent extends ActionComponent {
  MEMORIA_ROUTE_NAMES = MEMORIA_ROUTE_NAMES;
  textoActualizar = MSG_BUTTON_SAVE;
  private from: string;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: MemoriaActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.from = history.state.from;
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigateByUrl(this.from);
      }
    );
  }

  cancel(): void {
    this.router.navigateByUrl(this.from);
  }
}
