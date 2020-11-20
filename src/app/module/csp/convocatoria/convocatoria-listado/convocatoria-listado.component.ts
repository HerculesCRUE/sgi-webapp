import { Component, OnDestroy, OnInit } from '@angular/core';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SgiRestFilter, SgiRestFilterType, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { NGXLogger } from 'ngx-logger';
import { FormGroup, FormControl } from '@angular/forms';
import { forkJoin, from, Observable, of, Subscription } from 'rxjs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { catchError, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';

import { ROUTE_NAMES } from '@core/route.names';

import { SnackBarService } from '@core/services/snack-bar.service';
import { IConvocatoria } from '@core/models/csp/convocatoria';

import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { IModeloEjecucion, ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { DialogService } from '@core/services/dialog.service';
import { TipoEstadoConvocatoria } from '@core/enums/tipo-estado-convocatoria';
import { IsEntityValidator } from '@core/validators/is-entity-validador';

const MSG_BUTTON_NEW = marker('footer.csp.convocatoria.crear');
const MSG_ERROR = marker('csp.convocatoria.listado.error');
const MSG_ERROR_INIT = marker('csp.convocatoria.listado.error.cargar');
const LABEL_BUSCADOR_EMPRESAS_CONVOCANTE = marker('csp.convocatoria.entidad.convocante');
const LABEL_BUSCADOR_EMPRESAS_FINANCIADORAS = marker('csp.convocatoria.listado.entidad.financiadora');
const MSG_REACTIVE = marker('csp.convocatoria.listado.convocatoria.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.convocatoria.listado.convocatoria.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.convocatoria.listado.convocatoria.reactivar.error');
const MSG_DEACTIVATE = marker('csp.convocatoria.listado.convocatoria.desactivar');
const MSG_ERROR_DEACTIVATE = marker('csp.convocatoria.listado.convocatoria.desactivar.error');
const MSG_SUCCESS_DEACTIVATE = marker('csp.convocatoria.listado.convocatoria.desactivar.correcto');

interface IConvocatoriaListado {
  convocatoria: IConvocatoria;
  fase: IConvocatoriaFase;
  entidadConvocante: IConvocatoriaEntidadConvocante;
  entidadConvocanteEmpresa: IEmpresaEconomica;
  entidadFinanciadora: IConvocatoriaEntidadFinanciadora;
  entidadFinanciadoraEmpresa: IEmpresaEconomica;
}

@Component({
  selector: 'sgi-convocatoria-listado',
  templateUrl: './convocatoria-listado.component.html',
  styleUrls: ['./convocatoria-listado.component.scss']
})
export class ConvocatoriaListadoComponent extends AbstractTablePaginationComponent<IConvocatoriaListado> implements OnInit, OnDestroy {
  ROUTE_NAMES = ROUTE_NAMES;
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  convocatorias$: Observable<IConvocatoriaListado[]>;
  textoCrear = MSG_BUTTON_NEW;
  labelConvocante = LABEL_BUSCADOR_EMPRESAS_CONVOCANTE;
  labelFinanciadora = LABEL_BUSCADOR_EMPRESAS_FINANCIADORAS;

  busquedaAvanzada = false;

  private subscriptions = [] as Subscription[];

  selectedEmpresaConvocante: IEmpresaEconomica;
  selectedEmpresaFinanciadora: IEmpresaEconomica;
  convocatoriaEntidadGestora: IConvocatoriaEntidadGestora;

  private unidadGestionFiltered = [] as IUnidadGestion[];
  unidadesGestion$: Observable<IUnidadGestion[]>;

  private modelosEjecucionFiltered = [] as IModeloEjecucion[];
  modelosEjecucion$: Observable<IModeloEjecucion[]>;

  private finalidadFiltered = [] as ITipoFinalidad[];
  finalidades$: Observable<ITipoFinalidad[]>;

  private tipoAmbitoGeograficoFiltered = [] as ITipoAmbitoGeografico[];
  tipoAmbitosGeograficos$: Observable<ITipoAmbitoGeografico[]>;

  private fuenteFinanciacionFiltered = [] as IFuenteFinanciacion[];
  fuenteFinanciacion$: Observable<IFuenteFinanciacion[]>;

  private areaTematicaFiltered = [] as IAreaTematica[];
  areaTematica$: Observable<IAreaTematica[]>;

  empresaConvocante: string;
  empresaFinanciadora: string;

  estadoConvocatoria = Object.keys(TipoEstadoConvocatoria).map<string>(
    (key) => TipoEstadoConvocatoria[key]);

  empresaConvocanteText: string;
  empresaFinanciadoraText: string;

  constructor(
    protected logger: NGXLogger,
    protected snackBarService: SnackBarService,
    private convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private unidadGestionService: UnidadGestionService,
    private unidadModeloService: ModeloUnidadService,
    private modeloEjecucionService: ModeloEjecucionService,
    private tipoAmbitoGeograficoService: TipoAmbitoGeograficoService,
    private fuenteFinanciacionService: FuenteFinanciacionService,
    private areaTematicaService: AreaTematicaService,
    private dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(ConvocatoriaListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(18%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(ConvocatoriaListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      codigo: new FormControl(''),
      titulo: new FormControl(''),
      anio: new FormControl(''),
      activo: new FormControl('todos'),
      unidadGestion: new FormControl('', [IsEntityValidator.isValid()]),
      modeloEjecucion: new FormControl('', [IsEntityValidator.isValid()]),
      abiertoPlazoPresentacionSolicitud: new FormControl(''),
      finalidad: new FormControl(''),
      ambitoGeografico: new FormControl('', [IsEntityValidator.isValid()]),
      estado: new FormControl(''),
      entidadConvocante: new FormControl(''),
      entidadFinanciadora: new FormControl(''),
      fuenteFinanciacion: new FormControl(''),
      areaTematica: new FormControl('', [IsEntityValidator.isValid()]),
    });

    this.subscriptions.push(this.formGroup.get('unidadGestion').valueChanges.pipe(
      tap(() => this.loadModelosEjecucion())
    ).subscribe());

    this.subscriptions.push(this.formGroup.get('modeloEjecucion').valueChanges.pipe(
      tap(() => this.loadFinalidades())
    ).subscribe());

    this.loadAmbitosGeograficos();
    this.loadUnidadesGestion();
    this.loadModelosEjecucion();
    this.loadFinalidades();
    this.fuenteFinanciacion();
    this.loadAreasTematica();
    this.filter = this.createFilters();
    this.logger.debug(ConvocatoriaListadoComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IConvocatoriaListado>> {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.createObservable.name}()`, 'start');
    const observable$ = this.convocatoriaService.findAllTodosRestringidos(this.getFindOptions()).pipe(
      map(result => {
        const convocatorias = result.items.map((convocatoria) => {
          return {
            convocatoria,
            entidadConvocante: {} as IConvocatoriaEntidadConvocante,
            entidadConvocanteEmpresa: {} as IEmpresaEconomica,
            entidadFinanciadora: {} as IConvocatoriaEntidadFinanciadora,
            entidadFinanciadoraEmpresa: {} as IEmpresaEconomica,
            fase: {} as IConvocatoriaFase
          } as IConvocatoriaListado;
        });
        return {
          page: result.page,
          total: result.total,
          items: convocatorias
        } as SgiRestListResult<IConvocatoriaListado>;
      }),
      mergeMap(convocatoriaListados => {
        return from(convocatoriaListados.items).pipe(
          mergeMap((element) => {
            return this.convocatoriaService.findEntidadesFinanciadoras(element.convocatoria.id).pipe(
              map(entidadFinanciadora => {
                if (entidadFinanciadora.items.length > 0) {
                  element.entidadFinanciadora = entidadFinanciadora.items[0];
                }
                return element;
              }),
              switchMap(convocatoriaListado => {
                if (convocatoriaListado.entidadFinanciadora.id) {
                  return this.empresaEconomicaService.findById(convocatoriaListado.entidadFinanciadora.entidadRef).pipe(
                    map(empresaEconomica => {
                      convocatoriaListado.entidadFinanciadoraEmpresa = empresaEconomica;
                      return empresaEconomica;
                    }),
                  );
                }
                return of({} as IEmpresaEconomica);
              }),
              catchError(() => of(element))
            );
          })
        ).pipe(
          switchMap(() => {
            return of({
              page: convocatoriaListados.page,
              total: convocatoriaListados.total,
              items: convocatoriaListados.items
            } as SgiRestListResult<IConvocatoriaListado>);
          })
        );
      }),
      mergeMap(convocatoriaListados => {
        return from(convocatoriaListados.items).pipe(
          mergeMap((element) => {
            return this.convocatoriaService.findAllConvocatoriaFases(element.convocatoria.id).pipe(
              map(convocatoriaFase => {
                if (convocatoriaFase.items.length > 0) {
                  element.fase = convocatoriaFase.items[0];
                }
                return element;
              }),
              catchError(() => of(element))
            );
          })
        ).pipe(
          switchMap(() => {
            return of({
              page: convocatoriaListados.page,
              total: convocatoriaListados.total,
              items: convocatoriaListados.items
            } as SgiRestListResult<IConvocatoriaListado>);
          })
        );
      }),
      mergeMap(convocatoriaListados => {
        return from(convocatoriaListados.items).pipe(
          mergeMap((element) => {
            return this.convocatoriaService.findAllConvocatoriaEntidadConvocantes(element.convocatoria.id).pipe(
              map(convocatoriaEntidadConvocante => {
                if (convocatoriaEntidadConvocante.items.length > 0) {
                  element.entidadConvocante = convocatoriaEntidadConvocante.items[0];
                }
                return element;
              }),
              switchMap(convocatoriaListado => {
                if (convocatoriaListado.entidadFinanciadora.id) {
                  return this.empresaEconomicaService.findById(convocatoriaListado.entidadConvocante.entidadRef).pipe(
                    map(empresaEconomica => {
                      convocatoriaListado.entidadConvocanteEmpresa = empresaEconomica;
                      return empresaEconomica;
                    }),
                  );
                }
                return of({} as IEmpresaEconomica);
              }),
              catchError(() => of(element))
            );
          })
        ).pipe(
          switchMap(() => {
            return of({
              page: convocatoriaListados.page,
              total: convocatoriaListados.total,
              items: convocatoriaListados.items
            } as SgiRestListResult<IConvocatoriaListado>);
          })
        );
      })
    );
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.createObservable.name}()`, 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.initColumns.name}()`, 'start');
    this.columnas = [
      'codigo', 'titulo', 'fechaInicioSolicitud', 'fechaFinSolicitud',
      'entidadConvocante', 'planInvestigacion', 'entidadFinanciadora',
      'fuenteFinanciacion', 'activo', 'acciones'
    ];
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.initColumns.name}()`, 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadTable.name}(${reset})`, 'start');
    this.convocatorias$ = this.getObservableLoadTable(reset);
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadTable.name}(${reset})`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    this.addFiltro(filtros, 'codigo', SgiRestFilterType.LIKE, this.formGroup.controls.codigo.value);
    this.addFiltro(filtros, 'titulo', SgiRestFilterType.LIKE, this.formGroup.controls.titulo.value);

    const estadoActual = Object.keys(TipoEstadoConvocatoria)
      .filter(key => TipoEstadoConvocatoria[key] === this.formGroup.controls.estado.value)[0];
    this.addFiltro(filtros, 'estadoActual', SgiRestFilterType.EQUALS, estadoActual);

    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.addFiltro(filtros, 'anio', SgiRestFilterType.EQUALS, this.formGroup.controls.anio.value);
    this.addFiltro(filtros, 'unidadGestionRef', SgiRestFilterType.EQUALS, this.formGroup.controls.unidadGestion.value.acronimo);
    this.addFiltro(filtros, 'modeloEjecucion.id', SgiRestFilterType.EQUALS, this.formGroup.controls.modeloEjecucion.value.id);
    this.addFiltro(filtros, 'abiertoPlazoPresentacionSolicitud', SgiRestFilterType.EQUALS,
      this.formGroup.controls.abiertoPlazoPresentacionSolicitud.value);
    this.addFiltro(filtros, 'finalidad.id', SgiRestFilterType.EQUALS, this.formGroup.controls.finalidad.value.id);
    this.addFiltro(filtros, 'ambitoGeografico.id', SgiRestFilterType.EQUALS, this.formGroup.controls.ambitoGeografico.value.id);
    if (this.formGroup.controls.entidadConvocante.value) {
      this.addFiltro(filtros, 'convocatoriaEntidadConvocante.entidadRef',
        SgiRestFilterType.LIKE, this.formGroup.controls.entidadConvocante.value);
    } else {
      this.addFiltro(filtros, 'convocatoriaEntidadConvocante.entidadRef',
        SgiRestFilterType.LIKE, this.empresaFinanciadora);
    }
    if (this.formGroup.controls.entidadFinanciadora.value) {
      this.addFiltro(filtros, 'convocatoriaEntidadFinanciadora.entidadRef',
        SgiRestFilterType.LIKE, this.formGroup.controls.entidadFinanciadora.value);
    } else {
      this.addFiltro(filtros, 'convocatoriaEntidadFinanciadora.entidadRef',
        SgiRestFilterType.LIKE, this.empresaConvocante);
    }
    this.addFiltro(filtros, 'fuenteFinanciacion.id', SgiRestFilterType.EQUALS, this.formGroup.controls.fuenteFinanciacion.value.id);
    this.addFiltro(filtros, 'areaTematica.id', SgiRestFilterType.EQUALS, this.formGroup.controls.areaTematica.value.id);
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  onClearFilters() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.codigo.setValue('');
    this.formGroup.controls.titulo.setValue('');
    this.formGroup.controls.unidadGestion.setValue('');
    this.formGroup.controls.modeloEjecucion.setValue('');
    this.formGroup.controls.finalidad.setValue('');
    this.formGroup.controls.anio.setValue('');
    this.formGroup.controls.abiertoPlazoPresentacionSolicitud.setValue('');
    this.formGroup.controls.ambitoGeografico.setValue('');
    this.formGroup.controls.estado.setValue('');
    this.formGroup.controls.fuenteFinanciacion.setValue('');
    this.formGroup.controls.areaTematica.setValue('');
    this.formGroup.controls.activo.setValue('todos');
    this.setEmpresaFinanciadora({} as IEmpresaEconomica);
    this.setEmpresaConvocante({} as IEmpresaEconomica);
    this.onSearch();
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  /**
   * Cargar areas tematicas
   */
  private loadAreasTematica() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadAreasTematica.name}()`, 'start');
    this.suscripciones.push(
      this.areaTematicaService.findAll().subscribe(
        (res: SgiRestListResult<IAreaTematica>) => {
          this.areaTematicaFiltered = res.items;
          this.areaTematica$ = this.formGroup.controls.areaTematica.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroAreaTematica(value))
            );
          this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadAreasTematica.name}()`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadAreasTematica.name}()`, 'end');
        }
      )
    );
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadAreasTematica.name}()`, 'end');
  }

  /**
   * Cargar fuente financiacion
   */
  private fuenteFinanciacion() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.fuenteFinanciacion.name}()`, 'start');
    this.suscripciones.push(
      this.fuenteFinanciacionService.findAll().subscribe(
        (res: SgiRestListResult<IFuenteFinanciacion>) => {
          this.fuenteFinanciacionFiltered = res.items;
          this.fuenteFinanciacion$ = this.formGroup.controls.fuenteFinanciacion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroFuenteFinanciacion(value))
            );
          this.logger.debug(ConvocatoriaListadoComponent.name, `${this.fuenteFinanciacion.name}()`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(ConvocatoriaListadoComponent.name, `${this.fuenteFinanciacion.name}()`, 'end');
        }
      )
    );
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.fuenteFinanciacion.name}()`, 'end');
  }

  /**
   * Cargar unidad gestion
   */
  private loadUnidadesGestion() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadUnidadesGestion.name}()`, 'start');
    this.subscriptions.push(
      // TODO Debería filtrar por el rol
      this.unidadGestionService.findAll().subscribe(
        res => {
          this.unidadGestionFiltered = res.items;
          this.unidadesGestion$ = this.formGroup.controls.unidadGestion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroUnidadGestion(value))
            );
          this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadUnidadesGestion.name}()`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.error(ConvocatoriaListadoComponent.name, `${this.loadUnidadesGestion.name}()`, 'error');
        }
      )
    );
  }

  /**
   * Cargar ambitos geograficos
   */
  private loadAmbitosGeograficos() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadAmbitosGeograficos.name}()`, 'start');
    this.subscriptions.push(
      this.tipoAmbitoGeograficoService.findAll().subscribe(
        res => {
          this.tipoAmbitoGeograficoFiltered = res.items;
          this.tipoAmbitosGeograficos$ = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroTipoAmbitoGeografico(value))
            );
          this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadAmbitosGeograficos.name}()`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.error(ConvocatoriaListadoComponent.name, `${this.loadAmbitosGeograficos.name}()`, 'error');
        }
      )
    );
  }

  /**
   * Carga modelos ejecucion
   */
  private loadModelosEjecucion() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadModelosEjecucion.name}()`, 'start');
    this.formGroup.get('modeloEjecucion').setValue('');
    this.formGroup.get('finalidad').setValue('');
    const options = {
      filters: [
        {
          field: 'unidadGestionRef',
          type: SgiRestFilterType.EQUALS,
          value: this.formGroup.controls.unidadGestion.value.acronimo,
        } as SgiRestFilter
      ]
    } as SgiRestFindOptions;
    this.subscriptions.push(this.unidadModeloService.findAll(options).subscribe(
      res => {
        this.modelosEjecucionFiltered = res.items.map(item => item.modeloEjecucion);
        this.modelosEjecucion$ = this.formGroup.controls.modeloEjecucion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroModeloEjecucion(value))
          );
        this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadModelosEjecucion.name}()`, 'end');
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_INIT);
        this.logger.error(ConvocatoriaListadoComponent.name, `${this.loadModelosEjecucion.name}()`, 'error');
      }
    ));
  }

  /**
   * Carga finalidades
   */
  private loadFinalidades() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadFinalidades.name}()`, 'start');
    this.formGroup.get('finalidad').setValue('');
    const modeloEjecucion = this.formGroup.get('modeloEjecucion').value;
    if (modeloEjecucion) {
      const id = modeloEjecucion.id;
      if (id && !isNaN(id)) {
        this.subscriptions.push(
          this.modeloEjecucionService.findModeloTipoFinalidad(id).pipe(
            map(res => {
              const tipoFinalidades = res.items.map(modeloTipoFinalidad => modeloTipoFinalidad.tipoFinalidad);
              return tipoFinalidades;
            })
          ).subscribe(
            tipoFinalidades => {
              this.finalidadFiltered = tipoFinalidades;
              this.finalidades$ = this.formGroup.controls.finalidad.valueChanges
                .pipe(
                  startWith(''),
                  map(value => this.filtroFinalidades(value))
                );
              this.logger.debug(ConvocatoriaListadoComponent.name, `${this.loadFinalidades.name}()`, 'end');
            },
            () => {
              this.snackBarService.showError(MSG_ERROR_INIT);
              this.logger.error(ConvocatoriaListadoComponent.name, `${this.loadFinalidades.name}()`, 'error');
            }
          )
        );
      }
    }
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroUnidadGestion(value: string): IUnidadGestion[] {
    const filterValue = value.toString().toLowerCase();
    return this.unidadGestionFiltered.filter(unidadGestion => unidadGestion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroModeloEjecucion(value: string): IModeloEjecucion[] {
    const filterValue = value.toString().toLowerCase();
    return this.modelosEjecucionFiltered.filter(modeloEjecucion => modeloEjecucion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroFinalidades(value: string): ITipoFinalidad[] {
    const filterValue = value.toString().toLowerCase();
    return this.finalidadFiltered.filter(finalidad => finalidad.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroTipoAmbitoGeografico(value: string): ITipoAmbitoGeografico[] {
    const filterValue = value.toString().toLowerCase();
    return this.tipoAmbitoGeograficoFiltered.filter(
      ambitoGeografico => ambitoGeografico.nombre.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroFuenteFinanciacion(value: string): IFuenteFinanciacion[] {
    const filterValue = value.toString().toLowerCase();
    return this.fuenteFinanciacionFiltered.filter(fuente => fuente.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtra la lista devuelta area tematica
   *
   * @param value del input para autocompletar
   */
  private filtroAreaTematica(value: string): IAreaTematica[] {
    const filterValue = value.toString().toLowerCase();
    return this.areaTematicaFiltered.filter(area => area.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre de una gestión unidad.
   * @param unidadGestion gestión unidad.
   * @returns nombre de una gestión unidad.
   */
  getUnidadGestion(unidadGestion?: IUnidadGestion): string | undefined {
    return typeof unidadGestion === 'string' ? unidadGestion : unidadGestion?.nombre;
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
   * Devuelve el nombre de una fuente de financiacion.
   * @param fuente de financiacion fuente de financiacion.
   * @returns nombre de una fuente de financiacion
   */
  getFuenteFinanciacion(fuente?: IFuenteFinanciacion): string | undefined {
    return typeof fuente === 'string' ? fuente : fuente?.nombre;
  }

  /**
   * Devuelve el nombre de una area tematica
   * @param area area tematica
   * @returns nombre de area tematica
   */
  getAreaTematica(area?: IAreaTematica): string | undefined {
    return typeof area === 'string' ? area : area?.nombre;
  }

  /**
   * Mostrar busqueda avanzada
   */
  toggleBusquedaAvanzada() {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.toggleBusquedaAvanzada.name}()`, 'start');
    this.busquedaAvanzada = !this.busquedaAvanzada;
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.toggleBusquedaAvanzada.name}()`, 'end');
  }

  setEmpresaFinanciadora(empresa: IEmpresaEconomica): void {
    this.logger.debug(ConvocatoriaListadoComponent.name,
      `${this.setEmpresaFinanciadora.name}(value: ${empresa})`, 'start');
    this.formGroup.controls.entidadFinanciadora.setValue(empresa.personaRef);
    this.empresaFinanciadoraText = empresa.razonSocial;
    this.logger.debug(ConvocatoriaListadoComponent.name,
      `${this.setEmpresaFinanciadora.name}(value: ${empresa})`, 'end');
  }

  setEmpresaConvocante(empresa: IEmpresaEconomica): void {
    this.logger.debug(ConvocatoriaListadoComponent.name,
      `${this.setEmpresaConvocante.name}(value: ${empresa})`, 'start');
    this.formGroup.controls.entidadConvocante.setValue(empresa.personaRef);
    this.empresaConvocanteText = empresa.razonSocial;
    this.logger.debug(ConvocatoriaListadoComponent.name,
      `${this.setEmpresaConvocante.name}(value: ${empresa})`, 'end');
  }

  /**
   * Desactivar convocatoria
   * @param convocatoria convocatoria
   */
  deactivateConvocatoria(convocatoria: IConvocatoriaListado): void {
    this.logger.debug(ConvocatoriaListadoComponent.name, `${this.deactivateConvocatoria.name}()`, 'start');
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.convocatoriaService.desactivar(convocatoria.convocatoria.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_DEACTIVATE);
          this.loadTable();
          this.logger.debug(ConvocatoriaListadoComponent.name,
            `${this.deactivateConvocatoria.name}(convocatoria: ${convocatoria})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.error(ConvocatoriaListadoComponent.name,
            `${this.deactivateConvocatoria.name}(convocatoria: ${convocatoria})`, 'error');
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activamos una convocatoria
   * @param convocatoria convocatoria
   */
  activeConvocatoria(convocatoria: IConvocatoriaListado): void {
    this.logger.debug(ConvocatoriaListadoComponent.name,
      `${this.activeConvocatoria.name}(convocatoria: ${convocatoria})`, 'start');

    const suscription = this.dialogService.showConfirmation(MSG_REACTIVE).pipe(
      switchMap((accept) => {
        if (accept) {
          convocatoria.convocatoria.activo = true;
          return this.convocatoriaService.reactivar(convocatoria.convocatoria.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVE);
          this.loadTable();
          this.logger.debug(ConvocatoriaListadoComponent.name,
            `${this.activeConvocatoria.name}(convocatoria: ${convocatoria})`, 'end');
        },
        () => {
          convocatoria.convocatoria.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.error(ConvocatoriaListadoComponent.name,
            `${this.activeConvocatoria.name}(convocatoria: ${convocatoria})`, 'error');
        }
      );
    this.suscripciones.push(suscription);
  }

  ngOnDestroy(): void {
    this.logger.debug(AbstractTablePaginationComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones.forEach(x => x.unsubscribe());
    this.logger.debug(AbstractTablePaginationComponent.name, 'ngOnDestroy()', 'end');
  }

}
