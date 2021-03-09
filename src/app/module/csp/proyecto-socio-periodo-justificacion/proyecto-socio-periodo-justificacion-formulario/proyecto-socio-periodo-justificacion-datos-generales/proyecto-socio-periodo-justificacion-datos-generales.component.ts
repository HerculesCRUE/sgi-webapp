import { Component, OnDestroy } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IProyectoSocioPeriodoJustificacion } from '@core/models/csp/proyecto-socio-periodo-justificacion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { Subscription } from 'rxjs';
import { ProyectoSocioPeriodoJustificacionActionService } from '../../proyecto-socio-periodo-justificacion.action.service';
import { ProyectoSocioPeriodoJustificacionDatosGeneralesFragment } from './proyecto-socio-periodo-justificacion-datos-generales.fragment';

@Component({
  selector: 'sgi-proyecto-socio-periodo-justificacion-datos-generales',
  templateUrl: './proyecto-socio-periodo-justificacion-datos-generales.component.html',
  styleUrls: ['./proyecto-socio-periodo-justificacion-datos-generales.component.scss']
})
export class ProyectoSocioPeriodoJustificacionDatosGeneralesComponent extends
  FormFragmentComponent<IProyectoSocioPeriodoJustificacion> implements OnDestroy {
  formPart: ProyectoSocioPeriodoJustificacionDatosGeneralesFragment;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  private subscriptions: Subscription[] = [];

  /** ngx-mat-datetime-picker */
  showSeconds = true;
  defaultFechaInicioPresentacion = [0, 0, 0];
  defaultFechaFinPresentacion = [23, 59, 59];

  constructor(
    protected actionService: ProyectoSocioPeriodoJustificacionActionService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formPart = this.fragment as ProyectoSocioPeriodoJustificacionDatosGeneralesFragment;
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(36%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
