import { Component } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IPrograma } from '@core/models/csp/programa';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { PlanInvestigacionActionService } from '../../plan-investigacion.action.service';

@Component({
  selector: 'sgi-plan-investigacion-datos-generales',
  templateUrl: './plan-investigacion-datos-generales.component.html',
  styleUrls: ['./plan-investigacion-datos-generales.component.scss']
})
export class PlanInvestigacionDatosGeneralesComponent extends FormFragmentComponent<IPrograma> {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  constructor(
    readonly actionService: PlanInvestigacionActionService,
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
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
