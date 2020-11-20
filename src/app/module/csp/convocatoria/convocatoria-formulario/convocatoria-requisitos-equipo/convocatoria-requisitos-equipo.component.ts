import { Component, OnInit } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaRequisitoEquipo } from '@core/models/csp/convocatoria-requisito-equipo';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaRequisitosEquipoFragment } from './convocatoria-requisitos-equipo.fragment';

@Component({
  selector: 'sgi-convocatoria-requisitos-equipo',
  templateUrl: './convocatoria-requisitos-equipo.component.html',
  styleUrls: ['./convocatoria-requisitos-equipo.component.scss']
})
export class ConvocatoriaRequisitosEquipoComponent extends FormFragmentComponent<IConvocatoriaRequisitoEquipo> implements OnInit {
  formPart: ConvocatoriaRequisitosEquipoFragment;
  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesOne: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxFlexPropertiesEntidad: FxFlexProperties;

  constructor(
    protected readonly logger: NGXLogger,
    protected actionService: ConvocatoriaActionService,
    public translate: TranslateService
  ) {
    super(actionService.FRAGMENT.REQUISITOS_EQUIPO, actionService);
    this.logger.debug(ConvocatoriaRequisitosEquipoComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaRequisitosEquipoFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '1';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '4';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.logger.debug(ConvocatoriaRequisitosEquipoComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    this.logger.debug(ConvocatoriaRequisitosEquipoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.logger.debug(ConvocatoriaRequisitosEquipoComponent.name, 'ngOnInit()', 'end');
  }
}
