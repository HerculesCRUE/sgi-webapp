import { Component, OnDestroy, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { CLASIFICACION_CVN_MAP } from '@core/enums/clasificacion-cvn';
import { Estado, ESTADO_MAP } from '@core/models/csp/estado-proyecto';
import { IProyecto, TIPO_HORAS_ANUALES_MAP } from '@core/models/csp/proyecto';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { IModeloEjecucion, ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of, Subscription } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { ProyectoActionService } from '../../proyecto.action.service';
import { ProyectoFichaGeneralFragment } from './proyecto-ficha-general.fragment';

const MSG_ERROR_INIT = marker('csp.proyecto.datosGenerales.error.cargar');

@Component({
  selector: 'sgi-proyecto-ficha-general',
  templateUrl: './proyecto-ficha-general.component.html',
  styleUrls: ['./proyecto-ficha-general.component.scss']
})
export class ProyectoFichaGeneralComponent extends FormFragmentComponent<IProyecto> implements OnInit, OnDestroy {

  formPart: ProyectoFichaGeneralFragment;

  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesOne: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxFlexPropertiesEntidad: FxFlexProperties;

  private finalidadFiltered = [] as ITipoFinalidad[];
  finalidades$: Observable<ITipoFinalidad[]>;

  private modelosEjecucionFiltered = [] as IModeloEjecucion[];
  modelosEjecucion$: Observable<IModeloEjecucion[]>;

  private unidadGestionFiltered = [] as IUnidadGestion[];
  unidadesGestion$: Observable<IUnidadGestion[]>;

  private tipoAmbitoGeograficoFiltered = [] as ITipoAmbitoGeografico[];
  tipoAmbitosGeograficos$: Observable<ITipoAmbitoGeografico[]>;

  private subscriptions = [] as Subscription[];

  get CLASIFICACION_CVN_MAP() {
    return CLASIFICACION_CVN_MAP;
  }

  get TIPO_HORAS_ANUALES_MAP() {
    return TIPO_HORAS_ANUALES_MAP;
  }

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  private obligatorioTimesheet: boolean;
  requiredHoras = false;

  constructor(
    private readonly logger: NGXLogger,
    protected actionService: ProyectoActionService,
    private readonly snackBarService: SnackBarService,
    private unidadGestionService: UnidadGestionService,
    private modeloEjecucionService: ModeloEjecucionService,
    private unidadModeloService: ModeloUnidadService,
    private tipoAmbitoGeograficoService: TipoAmbitoGeograficoService
  ) {
    super(actionService.FRAGMENT.FICHA_GENERAL, actionService);
    this.formPart = this.fragment as ProyectoFichaGeneralFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesEntidad = new FxFlexProperties();
    this.fxFlexPropertiesEntidad.sm = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.md = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.gtMd = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.order = '3';

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(36%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '4';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadUnidadesGestion();
    this.loadAmbitosGeograficos();

    if (!this.fragment.isEdit()) {
      this.formGroup.controls.estado.setValue(Estado.BORRADOR);
    }

    this.subscriptions.push(this.formGroup.controls.costeHora.valueChanges.pipe(
      tap(() => this.validarCoste())
    ).subscribe());

    this.subscriptions.push(this.formGroup.controls.timesheet.valueChanges.pipe(
      tap(() => this.validarTimesheet())
    ).subscribe());

    this.subscriptions.push(
      this.formGroup.controls.colaborativo.valueChanges.subscribe(_ => {
        this.actionService.isProyectoColaborativo = this.formGroup.controls.colaborativo.value ?
          this.formGroup.controls.colaborativo.value : false;
      })
    );

    this.subscriptions.push(
      merge(
        this.formGroup.controls.fechaInicio.valueChanges,
        this.formGroup.controls.fechaFin.valueChanges,
        this.formGroup.controls.convocatoria.valueChanges,
      ).subscribe(() => this.formPart.checkFechas())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * En caso de ser NO timesheet
   * y SI calculo coste
   * Error en el formulario
   */
  private validarTimesheet() {
    if (this.formGroup.controls.timesheet.value === false && this.formGroup.controls.costeHora.value === true) {
      this.formGroup.controls.timesheet.setErrors({ invalid: true });
      this.formGroup.controls.timesheet.markAsTouched({ onlySelf: true });
    }
  }

  /**
   * En caso de activar coste hora personal
   * Habilitamos horas anuales
   */
  private validarCoste() {
    if (this.formGroup.controls.costeHora.value) {
      this.requiredHoras = true;
      if (this.formGroup.controls.timesheet.value === null || this.formGroup.controls.timesheet.value === false) {
        this.formGroup.controls.timesheet.setErrors({ invalid: true });
        this.formGroup.controls.timesheet.markAsTouched({ onlySelf: true });
        this.obligatorioTimesheet = true;
        this.requiredHoras = true;
      } else {
        this.obligatorioTimesheet = false;

        if (this.formGroup.controls.costeHora.value === true) {
          this.requiredHoras = true;
        } else {
          this.requiredHoras = false;
        }
        this.formGroup.controls.timesheet.updateValueAndValidity({ onlySelf: true });
      }
    } else {
      if (this.formGroup.controls.tipoHorasAnuales.value) {
        this.formGroup.controls.tipoHorasAnuales.patchValue(null);
        this.requiredHoras = false;
        this.formGroup.controls.tipoHorasAnuales.setValidators(null);
        this.formGroup.controls.tipoHorasAnuales.updateValueAndValidity({ onlySelf: true });
      }
      if (this.formGroup.controls.timesheet.value === false) {
        this.obligatorioTimesheet = false;
        this.requiredHoras = false;
        this.formGroup.controls.timesheet.updateValueAndValidity({ onlySelf: true });
      }
      this.requiredHoras = false;
      this.formGroup.controls.tipoHorasAnuales.setValidators(null);
      this.formGroup.controls.tipoHorasAnuales.updateValueAndValidity({ onlySelf: true });
    }
  }

  /**
   * Validacion timesheet por estado u obligatorio
   */
  validacionTimesheet() {
    if (this.formPart.abiertoRequired === true || this.obligatorioTimesheet === true) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Listado ambito geografico
   */
  private loadAmbitosGeograficos(): void {
    this.subscriptions.push(
      this.tipoAmbitoGeograficoService.findAll().subscribe(
        res => {
          this.tipoAmbitoGeograficoFiltered = res.items;
          this.tipoAmbitosGeograficos$ = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroTipoAmbitoGeografico(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  /**
   * Listado de modelos de ejecucion
   */
  loadModelosEjecucion(): void {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('unidadGestionRef', SgiRestFilterOperator.EQUALS, this.formGroup.controls.unidadGestion.value?.acronimo)
    };
    const subcription = this.unidadModeloService.findAll(options).subscribe(
      res => {
        this.modelosEjecucionFiltered = res.items.map(item => item.modeloEjecucion);
        this.modelosEjecucion$ = this.formGroup.controls.modeloEjecucion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroModeloEjecucion(value))
          );
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT);
      }
    );
    this.subscriptions.push(subcription);
  }

  /**
   * Listado de finalidades
   */
  loadFinalidades(): void {
    const modeloEjecucion = this.formGroup.get('modeloEjecucion').value;
    if (modeloEjecucion) {
      const id = modeloEjecucion.id;
      if (id && !isNaN(id)) {
        const options: SgiRestFindOptions = {
          filter: new RSQLSgiRestFilter('tipoFinalidad.activo', SgiRestFilterOperator.EQUALS, 'true')
        };
        this.subscriptions.push(
          this.modeloEjecucionService.findModeloTipoFinalidad(id, options).pipe(
            map(res => {
              return res.items.map(modeloTipoFinalidad => modeloTipoFinalidad.tipoFinalidad);
            })
          ).subscribe(
            tipoFinalidades => {
              this.finalidadFiltered = tipoFinalidades;
              this.finalidades$ = this.formGroup.controls.finalidad.valueChanges
                .pipe(
                  startWith(''),
                  map(value => this.filtroFinalidades(value))
                );
            },
            (error) => {
              this.logger.error(error);
              this.snackBarService.showError(MSG_ERROR_INIT);
            }
          )
        );
      }
    }
  }

  /**
   * Devuelve el nombre de una gestión unidad.
   *
   * @param unidadGestion gestión unidad.
   * @returns nombre de una gestión unidad.
   */
  getUnidadGestion(unidadGestion?: IUnidadGestion): string | undefined {
    return typeof unidadGestion === 'string' ? unidadGestion : unidadGestion?.nombre;
  }

  /**
   * Carga la lista de unidades de gestion seleccionables por el usuario
   */
  private loadUnidadesGestion(): void {
    this.subscriptions.push(
      this.unidadGestionService.findAllRestringidos().subscribe(
        res => {
          this.unidadGestionFiltered = res.items;
          this.unidadesGestion$ = this.formGroup.controls.unidadGestion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroUnidadGestion(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroModeloEjecucion(value: string): IModeloEjecucion[] {
    // Si no es un string no se filtra
    if (typeof value !== 'string') {
      return this.modelosEjecucionFiltered;
    }
    const filterValue = value.toString().toLowerCase();
    return this.modelosEjecucionFiltered.filter(modeloEjecucion => modeloEjecucion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroFinalidades(value: string): ITipoFinalidad[] {
    // Si no es un string no se filtra
    if (typeof value !== 'string') {
      return this.finalidadFiltered;
    }
    const filterValue = value.toString().toLowerCase();
    return this.finalidadFiltered.filter(finalidad => finalidad.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroUnidadGestion(value: string): IUnidadGestion[] {
    // Si no es un string no se filtra
    if (typeof value !== 'string') {
      return this.unidadGestionFiltered;
    }
    const filterValue = value.toString().toLowerCase();
    return this.unidadGestionFiltered.filter(unidadGestion => unidadGestion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre de un modelo de ejecución.
   * @param modeloEjecucion modelo de ejecución.
   * @returns nombre de un modelo de ejecución.
   */
  getModeloEjecucion(modeloEjecucion?: IModeloEjecucion): string | undefined {
    return typeof modeloEjecucion === 'string' ? modeloEjecucion : modeloEjecucion?.nombre;
  }

  /**
   * Devuelve el nombre de una finalidad.
   * @param finalidad finalidad.
   * @returns nombre de una finalidad.
   */
  getFinalidad(finalidad?: ITipoFinalidad): string | undefined {
    return typeof finalidad === 'string' ? finalidad : finalidad?.nombre;
  }

  /**
   * Devuelve el nombre de un ámbito geográfico.
   * @param tipoAmbitoGeografico ámbito geográfico.
   * @returns nombre de un ámbito geográfico.
   */
  getTipoAmbitoGeografico(tipoAmbitoGeografico?: ITipoAmbitoGeografico): string | undefined {
    return typeof tipoAmbitoGeografico === 'string' ? tipoAmbitoGeografico : tipoAmbitoGeografico?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroTipoAmbitoGeografico(value: string): ITipoAmbitoGeografico[] {
    // Si no es un string no se filtra
    if (typeof value !== 'string') {
      return this.tipoAmbitoGeograficoFiltered;
    }
    const filterValue = value?.toString().toLowerCase();
    return this.tipoAmbitoGeograficoFiltered.filter(
      ambitoGeografico => ambitoGeografico.nombre.toLowerCase().includes(filterValue)
    );
  }

  clearFinalidad(): void {
    this.formGroup.get('finalidad').setValue('');
    this.finalidadFiltered = [];
    this.finalidades$ = of();
  }

  clearModeloEjecuccion(): void {
    this.formGroup.get('modeloEjecucion').setValue('');
    this.modelosEjecucionFiltered = [];
    this.modelosEjecucion$ = of();
    this.clearFinalidad();
  }
}
