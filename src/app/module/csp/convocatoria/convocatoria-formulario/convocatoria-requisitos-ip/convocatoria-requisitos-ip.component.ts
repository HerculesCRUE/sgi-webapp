import { Component, OnInit } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaRequisitosIPFragment } from './convocatoria-requisitos-ip.fragment';
import { TranslateService } from '@ngx-translate/core';
import { IConvocatoriaRequisitoIP } from '@core/models/csp/convocatoria-requisito-ip';

@Component({
  selector: 'sgi-convocatoria-requisitos-ip',
  templateUrl: './convocatoria-requisitos-ip.component.html',
  styleUrls: ['./convocatoria-requisitos-ip.component.scss']
})

export class ConvocatoriaRequisitosIPComponent extends FormFragmentComponent<IConvocatoriaRequisitoIP> implements OnInit {
  formPart: ConvocatoriaRequisitosIPFragment;
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
    super(actionService.FRAGMENT.REQUISITOS_IP, actionService);
    this.logger.debug(ConvocatoriaRequisitosIPComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaRequisitosIPFragment;

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

    this.logger.debug(ConvocatoriaRequisitosIPComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    this.logger.debug(ConvocatoriaRequisitosIPComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.logger.debug(ConvocatoriaRequisitosIPComponent.name, 'ngOnInit()', 'end');
  }

}
