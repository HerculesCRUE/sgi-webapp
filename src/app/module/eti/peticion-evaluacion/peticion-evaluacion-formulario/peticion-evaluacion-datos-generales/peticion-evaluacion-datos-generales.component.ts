import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { MSG_PARAMS } from '@core/i18n';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { ITipoActividad } from '@core/models/eti/tipo-actividad';
import { ITipoInvestigacionTutelada } from '@core/models/eti/tipo-investigacion-tutelada';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoActividadService } from '@core/services/eti/tipo-actividad.service';
import { TipoInvestigacionTuteladaService } from '@core/services/eti/tipo-investigacion-tutelada.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PeticionEvaluacionActionService } from '../../peticion-evaluacion.action.service';
import { PeticionEvaluacionDatosGeneralesFragment } from './peticion-evaluacion-datos-generales.fragment';

const PETICION_EVALUACION_CODIGO_KEY = marker('eti.peticion-evaluacion.codigo');
const PETICION_EVALUACION_TITULO_KEY = marker('eti.peticion-evaluacion.titulo');
const PETICION_EVALUACION_FINANCIACION_KEY = marker('eti.peticion-evaluacion.financiacion');
const PETICION_EVALUACION_FECHA_INICIO_KEY = marker('eti.peticion-evaluacion.fecha-inicio');
const PETICION_EVALUACION_FECHA_FIN_KEY = marker('eti.peticion-evaluacion.fecha-fin');
const PETICION_EVALUACION_RESUMEN_KEY = marker('eti.peticion-evaluacion.resumen');
const PETICION_EVALUACION_VALOR_SOCIAL_KEY = marker('eti.peticion-evaluacion.valor-social');
const PETICION_EVALUACION_OBJETIVO_CIENTIFICO_KEY = marker('eti.peticion-evaluacion.objetivo-cientifico');
const PETICION_EVALUACION_DISENIO_METODOLOGICO_KEY = marker('eti.peticion-evaluacion.disenio-metodologico');
@Component({
  selector: 'sgi-peticion-evaluacion-datos-generales',
  templateUrl: './peticion-evaluacion-datos-generales.component.html',
  styleUrls: ['./peticion-evaluacion-datos-generales.component.scss']
})
export class PeticionEvaluacionDatosGeneralesComponent extends FormFragmentComponent<IPeticionEvaluacion> implements OnInit, OnDestroy {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  FormGroupUtil = FormGroupUtil;
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;

  private tipoActividades: ITipoActividad[] = [];
  private tipoInvestigacionTuteladas: ITipoInvestigacionTutelada[] = [];
  private suscripciones: Subscription[] = [];

  filteredTipoActividad: Observable<ITipoActividad[]>;
  filteredTipoInvestigacionTutelada: Observable<ITipoInvestigacionTutelada[]>;
  isInvestigacionTutelada$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  peticionEvaluacionFragment: PeticionEvaluacionDatosGeneralesFragment;

  msgParamFinanciacionEntity = {};
  msgParamFechaInicioEntity = {};
  msgParamFechaFinEntity = {};
  msgParamResumenEntity = {};
  msgParamValorSocialEntity = {};
  msgParamObjetivoCientificoEntity = {};
  msgParamDisenioMetodologicoEntity = {};
  msgParamTituloEntity = {};
  msgParamCodigoEntity = {};

  constructor(
    private readonly tipoActividadService: TipoActividadService,
    private readonly tipoInvestigacionTuteladaService: TipoInvestigacionTuteladaService,
    private actionService: PeticionEvaluacionActionService,
    private readonly translate: TranslateService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(50%-10px)';
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

    this.peticionEvaluacionFragment = this.fragment as PeticionEvaluacionDatosGeneralesFragment;
    this.isInvestigacionTutelada$ = (this.fragment as PeticionEvaluacionDatosGeneralesFragment).isTipoInvestigacionTutelada$;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
    this.loadTiposActividad();
    this.actionService.initializeEquiposInvestigador();
  }

  private setupI18N(): void {
    this.translate.get(
      PETICION_EVALUACION_CODIGO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamCodigoEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      PETICION_EVALUACION_TITULO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamTituloEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      PETICION_EVALUACION_FINANCIACION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFinanciacionEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      PETICION_EVALUACION_FECHA_INICIO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFechaInicioEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      PETICION_EVALUACION_FECHA_FIN_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFechaFinEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      PETICION_EVALUACION_RESUMEN_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamResumenEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      PETICION_EVALUACION_VALOR_SOCIAL_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamValorSocialEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      PETICION_EVALUACION_OBJETIVO_CIENTIFICO_KEY,
      MSG_PARAMS.CARDINALIRY.PLURAL
    ).subscribe((value) => this.msgParamObjetivoCientificoEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      PETICION_EVALUACION_DISENIO_METODOLOGICO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamDisenioMetodologicoEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });
  }

  /**
   * Recupera los tipos de actividad
   */
  loadTiposActividad() {
    this.suscripciones.push(this.tipoActividadService.findAll().subscribe(
      (response) => {
        this.tipoActividades = response.items;

        this.filteredTipoActividad = this.formGroup.controls.tipoActividad.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterTipoActividad(value))
          );
      }));
  }

  /**
   * Recupera los tipos de Investigación tutelada.
   */
  loadTipoInvestigacionTuteladas() {
    this.suscripciones.push(this.tipoInvestigacionTuteladaService.findAll().subscribe(
      (response) => {
        this.tipoInvestigacionTuteladas = response.items;

        this.filteredTipoInvestigacionTutelada = this.formGroup.controls.tipoInvestigacionTutelada.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterTipoInvestigacionTutelada(value))
          );
      }));
  }

  /**
   * Devuelve el nombre de un tipo de actividad
   * @param tipoActividad tipo actividad
   * @returns nombre de un tipo de actividad
   */
  getTipoActividad(tipoActividad?: ITipoActividad): string | undefined {
    return tipoActividad?.nombre;
  }

  selectTipoActividad(tipoActividad: ITipoActividad): void {
    if (tipoActividad.id === 3) {
      this.isInvestigacionTutelada$.next(true);
      this.formGroup.controls.tipoInvestigacionTutelada.setValidators(new NullIdValidador().isValid());
      this.formGroup.controls.tipoInvestigacionTutelada.updateValueAndValidity();
      this.loadTipoInvestigacionTuteladas();
    } else {
      this.isInvestigacionTutelada$.next(false);
      this.peticionEvaluacionFragment.clearInvestigacionTutelada();
      this.formGroup.controls.tipoInvestigacionTutelada.clearValidators();
      this.formGroup.controls.tipoInvestigacionTutelada.updateValueAndValidity();
    }
  }

  /**
   * Devuelve el nombre de un tipo de actividad
   * @param investigacionTutelada tipo actividad
   * @returns nombre de un tipo de actividad
   */
  getTipoInvestigacionTutelada(investigacionTutelada?: ITipoInvestigacionTutelada): string | undefined {
    return investigacionTutelada?.nombre;
  }

  /**
   * Filtro de campo autocompletable tipo actividad.
   * @param value value a filtrar (string o nombre tipo actividad).
   * @returns lista de tipos de actividad filtrados.
   */
  private filterTipoActividad(value: string | ITipoActividad): ITipoActividad[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tipoActividades.filter
      (tipoActividad => tipoActividad.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtro de campo autocompletable tipo investigacion tutelada.
   * @param value value a filtrar (string o nombre tipo investigacion tutelada).
   * @returns lista de tipos de investigacion tutelada filtrados.
   */
  private filterTipoInvestigacionTutelada(value: string | ITipoInvestigacionTutelada): ITipoInvestigacionTutelada[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value?.nombre?.toLowerCase();
    }

    return this.tipoInvestigacionTuteladas.filter
      (tipoInvestigacionTutelada => tipoInvestigacionTutelada.nombre.toLowerCase().includes(filterValue));
  }

  ngOnDestroy(): void {
    this.suscripciones?.forEach(x => x.unsubscribe());
  }

}
