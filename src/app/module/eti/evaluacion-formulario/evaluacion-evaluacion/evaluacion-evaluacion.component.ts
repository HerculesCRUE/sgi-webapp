import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { NGXLogger } from 'ngx-logger';

import {
  EvaluacionListadoAnteriorMemoriaComponent,
} from '../evaluacion-listado-anterior-memoria/evaluacion-listado-anterior-memoria.component';
import { FormFragmentComponent } from '@core/component/fragment.component';

import { IEvaluacion } from '@core/models/eti/evaluacion';
import { Subscription, Observable } from 'rxjs';
import { IDictamen } from '@core/models/eti/dictamen';
import { EvaluacionEvaluacionFragment } from './evaluacion-evaluacion.fragment';
import { IMemoria } from '@core/models/eti/memoria';
import { TipoEvaluacionService } from '@core/services/eti/tipo-evaluacion.service';
import { EvaluacionFormularioActionService } from '../evaluacion-formulario.action.service';
import { openInformeFavorableMemoria, openInformeFavorableTipoRatificacion } from '@core/services/pentaho.service';

@Component({
  selector: 'sgi-evaluacion-evaluacion',
  templateUrl: './evaluacion-evaluacion.component.html',
  styleUrls: ['./evaluacion-evaluacion.component.scss']
})
export class EvaluacionEvaluacionComponent extends FormFragmentComponent<IMemoria> implements AfterViewInit, OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;

  @ViewChild('evaluaciones') evaluaciones: EvaluacionListadoAnteriorMemoriaComponent;

  dictamenListado: IDictamen[];
  filteredDictamenes: Observable<IDictamen[]>;
  suscriptions: Subscription[] = [];

  formPart: EvaluacionEvaluacionFragment;

  constructor(
    protected readonly logger: NGXLogger,
    private actionService: EvaluacionFormularioActionService,
    private tipoEvaluacionService: TipoEvaluacionService
  ) {
    super(actionService.FRAGMENT.EVALUACIONES, actionService);
    this.logger.debug(EvaluacionEvaluacionComponent.name, 'constructor()', 'start');
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

    this.formPart = this.fragment as EvaluacionEvaluacionFragment;

    this.logger.debug(EvaluacionEvaluacionComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    this.logger.debug(EvaluacionEvaluacionComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.suscriptions.push(this.formGroup.controls.dictamen.valueChanges.subscribe((dictamen) => {
      this.actionService.setDictamen(dictamen);
    }));
    this.suscriptions.push((this.fragment as EvaluacionEvaluacionFragment).evaluacion$.subscribe((evaluacion) => {
      if (evaluacion) {
        this.loadDictamenes(evaluacion);
      }
    }));
    this.logger.debug(EvaluacionEvaluacionComponent.name, 'ngOnInit()', 'end');
  }

  ngAfterViewInit(): void {
    this.logger.debug(EvaluacionEvaluacionComponent.name, 'ngAfterViewInit()', 'start');
    this.evaluaciones.memoriaId = this.actionService.getEvaluacion()?.memoria?.id;
    this.evaluaciones.evaluacionId = this.actionService.getEvaluacion()?.id;
    this.evaluaciones.ngAfterViewInit();
    this.logger.debug(EvaluacionEvaluacionComponent.name, 'ngAfterViewInit()', 'end');
  }

  generateInformeDictamenFavorable(idTipoMemoria: number): void {
    if (idTipoMemoria === 1) {
      openInformeFavorableMemoria(this.actionService.getEvaluacion()?.id);
    }
    else if (idTipoMemoria === 3) {
      openInformeFavorableTipoRatificacion(this.actionService.getEvaluacion()?.id);
    }
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
    this.logger.debug(EvaluacionEvaluacionComponent.name,
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

    this.logger.debug(EvaluacionEvaluacionComponent.name,
      'getDictamenes()',
      'end');
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((suscription) => suscription.unsubscribe());
  }

}
