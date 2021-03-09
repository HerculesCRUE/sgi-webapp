import { Component } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';

@Component({
  selector: 'sgi-modelo-ejecucion-datos-generales',
  templateUrl: './modelo-ejecucion-datos-generales.component.html',
  styleUrls: ['./modelo-ejecucion-datos-generales.component.scss']
})
export class ModeloEjecucionDatosGeneralesComponent extends FormFragmentComponent<IModeloEjecucion> {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  key: number;

  constructor(
    readonly actionService: ModeloEjecucionActionService,
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);

    this.key = this.fragment.getKey() as number;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.xs = 'column';
  }

}
