import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IMemoriaWithPersona } from '@core/models/eti/memoria-with-persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { NGXLogger } from 'ngx-logger';
import { SeguimientoFormularioActionService } from '../seguimiento-formulario.action.service';
import { SeguimientoListadoAnteriorMemoriaComponent } from '../seguimiento-listado-anterior-memoria/seguimiento-listado-anterior-memoria.component';

@Component({
  selector: 'sgi-seguimiento-datos-memoria',
  templateUrl: './seguimiento-datos-memoria.component.html',
  styleUrls: ['./seguimiento-datos-memoria.component.scss']
})
export class SeguimientoDatosMemoriaComponent extends FormFragmentComponent<IMemoriaWithPersona> implements AfterViewInit {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;

  @ViewChild('evaluaciones') evaluaciones: SeguimientoListadoAnteriorMemoriaComponent;

  constructor(
    protected readonly logger: NGXLogger,
    private actionService: SeguimientoFormularioActionService
  ) {
    super(actionService.FRAGMENT.MEMORIA, actionService);
    this.logger.debug(SeguimientoDatosMemoriaComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.logger.debug(SeguimientoDatosMemoriaComponent.name, 'constructor()', 'end');
  }

  ngAfterViewInit(): void {
    this.logger.debug(SeguimientoDatosMemoriaComponent.name, 'ngAfterViewInit()', 'start');
    this.evaluaciones.memoriaId = this.actionService.getEvaluacion()?.memoria?.id;
    this.evaluaciones.evaluacionId = this.actionService.getEvaluacion()?.id;
    this.evaluaciones.ngAfterViewInit();
    this.logger.debug(SeguimientoDatosMemoriaComponent.name, 'ngAfterViewInit()', 'end');
  }
}
