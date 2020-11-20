import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { NGXLogger } from 'ngx-logger';


import { FormFragmentComponent } from '@core/component/fragment.component';

import { IEvaluacion } from '@core/models/eti/evaluacion';
import { Subscription, Observable } from 'rxjs';
import { IDictamen } from '@core/models/eti/dictamen';
import { IMemoria } from '@core/models/eti/memoria';
import { TipoEvaluacionService } from '@core/services/eti/tipo-evaluacion.service';
import { SeguimientoEvaluacionFragment } from './seguimiento-evaluacion.fragment';
import { SeguimientoListadoAnteriorMemoriaComponent } from '../seguimiento-listado-anterior-memoria/seguimiento-listado-anterior-memoria.component';
import { SeguimientoFormularioActionService } from '../seguimiento-formulario.action.service';

@Component({
  selector: 'sgi-seguimiento-evaluacion',
  templateUrl: './seguimiento-evaluacion.component.html',
  styleUrls: ['./seguimiento-evaluacion.component.scss']
})
export class SeguimientoEvaluacionComponent extends FormFragmentComponent<IMemoria> implements AfterViewInit, OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;

  @ViewChild('evaluaciones') evaluaciones: SeguimientoListadoAnteriorMemoriaComponent;

  dictamenListado: IDictamen[];
  filteredDictamenes: Observable<IDictamen[]>;
  suscriptions: Subscription[] = [];

  constructor(
    protected readonly logger: NGXLogger,
    private actionService: SeguimientoFormularioActionService,
    private tipoEvaluacionService: TipoEvaluacionService
  ) {
    super(actionService.FRAGMENT.EVALUACIONES, actionService);
    this.logger.debug(SeguimientoEvaluacionComponent.name, 'constructor()', 'start');
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

    this.logger.debug(SeguimientoEvaluacionComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    this.logger.debug(SeguimientoEvaluacionComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.suscriptions.push(this.formGroup.controls.dictamen.valueChanges.subscribe((dictamen) => {
      this.actionService.setDictamen(dictamen);
    }));
    this.suscriptions.push((this.fragment as SeguimientoEvaluacionFragment).evaluacion$.subscribe((evaluacion) => {
      if (evaluacion) {
        this.loadDictamenes(evaluacion);
      }
    }));
    this.logger.debug(SeguimientoEvaluacionComponent.name, 'ngOnInit()', 'end');
  }

  ngAfterViewInit(): void {
    this.logger.debug(SeguimientoEvaluacionComponent.name, 'ngAfterViewInit()', 'start');
    this.evaluaciones.memoriaId = this.actionService.getEvaluacion()?.memoria?.id;
    this.evaluaciones.evaluacionId = this.actionService.getEvaluacion()?.id;
    this.evaluaciones.ngAfterViewInit();
    this.logger.debug(SeguimientoEvaluacionComponent.name, 'ngAfterViewInit()', 'end');
  }

  /**
   * Devuelve el nombre de un dictamen.
   * @param dictamen dictamen
   * returns nombre dictamen
   */
  getDictamen(dictamen: IDictamen): string {
    return dictamen?.nombre;
  }

  /**
   * Recupera un listado de los dictamenes que hay en el sistema.
   */
  loadDictamenes(evaluacion: IEvaluacion): void {
    this.logger.debug(SeguimientoEvaluacionComponent.name,
      'getDictamenes()',
      'start');

    /**
     * Devuelve el listado de dictámenes dependiendo del tipo de Evaluación y si es de Revisión Mínima
     */
    this.suscriptions.push(this.tipoEvaluacionService.findAllDictamenByTipoEvaluacionAndRevisionMinima(
      evaluacion.tipoEvaluacion.id, evaluacion.esRevMinima).subscribe(
        (response) => {
          this.dictamenListado = response.items;
        }));

    this.logger.debug(SeguimientoEvaluacionComponent.name,
      'getDictamenes()',
      'end');
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((suscription) => suscription.unsubscribe());
  }

}
