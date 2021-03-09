import { Component } from '@angular/core';
import { ConvocatoriaConceptoGastoActionService } from '../convocatoria-concepto-gasto.action.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES } from '../convocatoria-concepto-gasto-route-names';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from '@core/services/dialog.service';

const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.convocatoria-concepto-gasto.crear.correcto');
const MSG_ERROR = marker('csp.convocatoria-concepto-gasto.crear.error');

@Component({
  selector: 'sgi-convocatoria-concepto-gasto-crear',
  templateUrl: './convocatoria-concepto-gasto-crear.component.html',
  styleUrls: ['./convocatoria-concepto-gasto-crear.component.scss'],
  viewProviders: [
    ConvocatoriaConceptoGastoActionService
  ]
})
export class ConvocatoriaConceptoGastoCrearComponent extends ActionComponent {
  CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES = CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_SAVE;
  urlFrom: string;

  constructor(
    protected logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ConvocatoriaConceptoGastoActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
    this.urlFrom = history.state?.from;
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      () => {
        this.snackBarService.showError(MSG_ERROR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate([this.urlFrom]);
      }
    );
  }

  cancel(): void {
    this.router.navigateByUrl(this.urlFrom);
  }
}
