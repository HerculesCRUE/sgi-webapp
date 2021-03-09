import { Component } from '@angular/core';
import { CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES } from '../convocatoria-concepto-gasto-route-names';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from '@core/services/dialog.service';
import { ActionComponent } from '@core/component/action.component';
import { ConvocatoriaConceptoGastoActionService } from '../convocatoria-concepto-gasto.action.service';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_SUCCESS = marker('csp.convocatoria-concepto-gasto.editar.correcto');
const MSG_ERROR = marker('csp.convocatoria-concepto-gasto.editar.error');

@Component({
  selector: 'sgi-convocatoria-concepto-gasto-editar',
  templateUrl: './convocatoria-concepto-gasto-editar.component.html',
  styleUrls: ['./convocatoria-concepto-gasto-editar.component.scss'],
  viewProviders: [
    ConvocatoriaConceptoGastoActionService
  ]
})
export class ConvocatoriaConceptoGastoEditarComponent extends ActionComponent {

  CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES = CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES;

  textoEditar = MSG_BUTTON_EDIT;
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
        this.returnUrl();
      }
    );
  }

  cancel(): void {
    this.returnUrl();
  }


  private returnUrl() {
    this.router.navigateByUrl(this.urlFrom);
  }
}
