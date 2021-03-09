import { Component } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { AreaTematicaActionService } from '../../area-tematica.action.service';

@Component({
  selector: 'sgi-area-tematica-datos-generales',
  templateUrl: './area-tematica-datos-generales.component.html',
  styleUrls: ['./area-tematica-datos-generales.component.scss']
})
export class AreaTematicaDatosGeneralesComponent extends FormFragmentComponent<IAreaTematica> {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  constructor(
    readonly actionService: AreaTematicaActionService,
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