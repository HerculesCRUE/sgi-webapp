import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { MSG_PARAMS } from '@core/i18n';
import { IDictamen } from '@core/models/eti/dictamen';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IMemoria } from '@core/models/eti/memoria';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoEvaluacionService } from '@core/services/eti/tipo-evaluacion.service';
import { openInformeFavorableMemoria, openInformeFavorableTipoRatificacion } from '@core/services/pentaho.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { EvaluacionFormularioActionService } from '../evaluacion-formulario.action.service';
import {
  EvaluacionListadoAnteriorMemoriaComponent
} from '../evaluacion-listado-anterior-memoria/evaluacion-listado-anterior-memoria.component';
import { EvaluacionEvaluacionFragment } from './evaluacion-evaluacion.fragment';

const EVALUACION_DICTAMEN_KEY = marker('eti.dictamen');

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

  msgParamDictamenEntity = {};

  get MSG_PARAMS() {
    return MSG_PARAMS;
  }

  constructor(
    private actionService: EvaluacionFormularioActionService,
    private tipoEvaluacionService: TipoEvaluacionService,
    private readonly translate: TranslateService
  ) {
    super(actionService.FRAGMENT.EVALUACIONES, actionService);
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
  }

  ngOnInit() {
    super.ngOnInit();
    this.setupI18N();
    this.suscriptions.push(this.formGroup.controls.dictamen.valueChanges.subscribe((dictamen) => {
      this.actionService.setDictamen(dictamen);
    }));
    this.suscriptions.push((this.fragment as EvaluacionEvaluacionFragment).evaluacion$.subscribe((evaluacion) => {
      if (evaluacion) {
        this.loadDictamenes(evaluacion);
      }
    }));
  }

  private setupI18N(): void {
    this.translate.get(
      EVALUACION_DICTAMEN_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamDictamenEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });
  }

  ngAfterViewInit(): void {
    this.evaluaciones.memoriaId = this.actionService.getEvaluacion()?.memoria?.id;
    this.evaluaciones.evaluacionId = this.actionService.getEvaluacion()?.id;
    this.evaluaciones.ngAfterViewInit();
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
    /**
     * Devuelve el listado de dictámenes dependiendo del tipo de Evaluación y si es de Revisión Mínima
     */
    this.suscriptions.push(this.tipoEvaluacionService.findAllDictamenByTipoEvaluacionAndRevisionMinima(
      evaluacion.tipoEvaluacion.id, evaluacion.esRevMinima).subscribe(
        (response) => {
          this.dictamenListado = response.items;
        }));
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((suscription) => suscription.unsubscribe());
  }

}
