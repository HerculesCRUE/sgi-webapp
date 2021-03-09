import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { ESTADO_MAP, IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { IModeloEjecucion, ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { ROUTE_NAMES } from '@core/route.names';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { DialogService } from '@core/services/dialog.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { SgiAuthService } from '@sgi/framework/auth';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { NGXLogger } from 'ngx-logger';
import { from, Observable, of, Subscription } from 'rxjs';
import { map, mergeAll, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';




const MSG_BUTTON_NEW = marker('footer.csp.convocatoria.crear');
const MSG_ERROR = marker('csp.convocatoria.listado.error');
const MSG_ERROR_INIT = marker('csp.convocatoria.listado.error.cargar');
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
export class ConvocatoriaListadoComponent extends AbstractTablePaginationComponent<IConvocatoriaListado> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  convocatorias$: Observable<IConvocatoriaListado[]>;
  textoCrear = MSG_BUTTON_NEW;

  busquedaAvanzada = false;

  private subscriptions: Subscription[] = [];

  convocatoriaEntidadGestora: IConvocatoriaEntidadGestora;

  private unidadGestionFiltered: IUnidadGestion[] = [];
  unidadesGestion$: Observable<IUnidadGestion[]>;

  private modelosEjecucionFiltered: IModeloEjecucion[] = [];
  modelosEjecucion$: Observable<IModeloEjecucion[]>;

  private finalidadFiltered: ITipoFinalidad[] = [];
  finalidades$: Observable<ITipoFinalidad[]>;

  private tipoAmbitoGeograficoFiltered: ITipoAmbitoGeografico[] = [];
  tipoAmbitosGeograficos$: Observable<ITipoAmbitoGeografico[]>;

  private fuenteFinanciacionFiltered: IFuenteFinanciacion[] = [];
  fuenteFinanciacion$: Observable<IFuenteFinanciacion[]>;

  private areaTematicaFiltered: IAreaTematica[] = [];
  areaTematica$: Observable<IAreaTematica[]>;

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  mapModificable: Map<number, boolean> = new Map();

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    private convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private unidadGestionService: UnidadGestionService,
    private unidadModeloService: ModeloUnidadService,
    private modeloEjecucionService: ModeloEjecucionService,
    private tipoAmbitoGeograficoService: TipoAmbitoGeograficoService,
    private fuenteFinanciacionService: FuenteFinanciacionService,
    private areaTematicaService: AreaTematicaService,
    private dialogService: DialogService,
    public authService: SgiAuthService
  ) {
    super(snackBarService, MSG_ERROR);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(18%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup = new FormGroup({
      codigo: new FormControl(''),
      titulo: new FormControl(''),
      anio: new FormControl(''),
      activo: new FormControl('true'),
      unidadGestion: new FormControl('', [IsEntityValidator.isValid()]),
      modeloEjecucion: new FormControl('', [IsEntityValidator.isValid()]),
      abiertoPlazoPresentacionSolicitud: new FormControl(''),
      finalidad: new FormControl(''),
      ambitoGeografico: new FormControl('', [IsEntityValidator.isValid()]),
      estado: new FormControl(null),
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
    this.filter = this.createFilter();
  }

  protected createObservable(): Observable<SgiRestListResult<IConvocatoriaListado>> {
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
      switchMap((result) => {
        return from(result.items).pipe(
          mergeMap(element => {
            return this.convocatoriaService.modificable(element.convocatoria.id).pipe(
              map((value) => {
                this.mapModificable.set(element.convocatoria.id, value);
                return element;
              })
            );
          }),
          map((convocatoriaListado) => {
            return this.convocatoriaService.findEntidadesFinanciadoras(convocatoriaListado.convocatoria.id).pipe(
              map(entidadFinanciadora => {
                if (entidadFinanciadora.items.length > 0) {
                  convocatoriaListado.entidadFinanciadora = entidadFinanciadora.items[0];
                }
                return convocatoriaListado;
              }),
              switchMap(() => {
                if (convocatoriaListado.entidadFinanciadora.id) {
                  return this.empresaEconomicaService.findById(convocatoriaListado.entidadFinanciadora.empresa.personaRef).pipe(
                    map(empresaEconomica => {
                      convocatoriaListado.entidadFinanciadoraEmpresa = empresaEconomica;
                      return convocatoriaListado;
                    }),
                  );
                }
                return of(convocatoriaListado);
              }),
              switchMap(() => {
                return this.convocatoriaService.findAllConvocatoriaFases(convocatoriaListado.convocatoria.id).pipe(
                  map(convocatoriaFase => {
                    if (convocatoriaFase.items.length > 0) {
                      convocatoriaListado.fase = convocatoriaFase.items[0];
                    }
                    return convocatoriaListado;
                  })
                );
              }),
              switchMap(() => {
                return this.convocatoriaService.findAllConvocatoriaEntidadConvocantes(convocatoriaListado.convocatoria.id).pipe(
                  map(convocatoriaEntidadConvocante => {
                    if (convocatoriaEntidadConvocante.items.length > 0) {
                      convocatoriaListado.entidadConvocante = convocatoriaEntidadConvocante.items[0];
                    }
                    return convocatoriaListado;
                  }),
                  switchMap(() => {
                    if (convocatoriaListado.entidadConvocante.id) {
                      return this.empresaEconomicaService.findById(convocatoriaListado.entidadConvocante.entidad.personaRef).pipe(
                        map(empresaEconomica => {
                          convocatoriaListado.entidadConvocanteEmpresa = empresaEconomica;
                          return convocatoriaListado;
                        }),
                      );
                    }
                    return of(convocatoriaListado);
                  }),
                );
              })
            );
          }),
          mergeAll(),
          map(() => result)
        );
      }),
    );

    return observable$;
  }

  protected initColumns(): void {
    this.columnas = [
      'codigo', 'titulo', 'fechaInicioSolicitud', 'fechaFinSolicitud',
      'entidadConvocante', 'planInvestigacion', 'entidadFinanciadora',
      'fuenteFinanciacion', 'estado', 'activo', 'acciones'
    ];
  }

  protected loadTable(reset?: boolean): void {
    this.convocatorias$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('codigo', SgiRestFilterOperator.LIKE_ICASE, controls.codigo.value);

    filter
      .and('titulo', SgiRestFilterOperator.LIKE_ICASE, controls.titulo.value)
      .and('estado', SgiRestFilterOperator.EQUALS, controls.estado.value);
    if (controls.activo.value !== 'todos') {
      filter.and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value);
    }
    filter
      .and('anio', SgiRestFilterOperator.EQUALS, controls.anio.value)
      .and('unidadGestionRef', SgiRestFilterOperator.EQUALS, controls.unidadGestion.value?.acronimo)
      .and('modeloEjecucion.id', SgiRestFilterOperator.EQUALS, controls.modeloEjecucion.value?.id?.toString())
      .and('abiertoPlazoPresentacionSolicitud', SgiRestFilterOperator.EQUALS, controls.abiertoPlazoPresentacionSolicitud.value)
      .and('finalidad.id', SgiRestFilterOperator.EQUALS, controls.finalidad.value?.id?.toString())
      .and('ambitoGeografico.id', SgiRestFilterOperator.EQUALS, controls.ambitoGeografico.value?.id?.toString())
      .and('entidadesConvocantes.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadConvocante.value?.personaRef)
      .and('entidadesFinanciadoras.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadFinanciadora.value?.personaRef)
      .and('entidadesFinanciadoras.fuenteFinanciacion.id', SgiRestFilterOperator.EQUALS, controls.fuenteFinanciacion.value?.id?.toString())
      .and('areasTematicas.id', SgiRestFilterOperator.EQUALS, controls.areaTematica.value?.id?.toString());

    return filter;
  }

  onClearFilters() {
    super.onClearFilters();
    this.formGroup.controls.activo.setValue('true');
    this.onSearch();
  }

  /**
   * Cargar areas tematicas
   */
  private loadAreasTematica() {
    this.suscripciones.push(
      this.areaTematicaService.findAllGrupo().subscribe(
        (res) => {
          this.areaTematicaFiltered = res.items;
          this.areaTematica$ = this.formGroup.controls.areaTematica.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroAreaTematica(value))
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
   * Cargar fuente financiacion
   */
  private fuenteFinanciacion() {
    this.suscripciones.push(
      this.fuenteFinanciacionService.findAll().subscribe(
        (res) => {
          this.fuenteFinanciacionFiltered = res.items;
          this.fuenteFinanciacion$ = this.formGroup.controls.fuenteFinanciacion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroFuenteFinanciacion(value))
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
   * Cargar unidad gestion
   */
  private loadUnidadesGestion() {
    this.subscriptions.push(
      this.unidadGestionService.findAll().pipe(
        map(res =>
          res.items.filter(unidad =>
            this.authService.hasAuthority(`CSP-CONV-C_${unidad.acronimo}`)
          )
        )
      ).subscribe(
        unidades => {
          this.unidadGestionFiltered = unidades;
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
   * Cargar ambitos geograficos
   */
  private loadAmbitosGeograficos() {
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
   * Carga modelos ejecucion
   */
  private loadModelosEjecucion() {
    this.formGroup.get('modeloEjecucion').setValue('');
    this.formGroup.get('finalidad').setValue('');
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('unidadGestionRef', SgiRestFilterOperator.EQUALS, this.formGroup.controls.unidadGestion.value.acronimo)
    };
    this.subscriptions.push(this.unidadModeloService.findAll(options).subscribe(
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
    ));
  }

  /**
   * Carga finalidades
   */
  private loadFinalidades() {
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
    this.busquedaAvanzada = !this.busquedaAvanzada;
  }

  /**
   * Desactivar convocatoria
   * @param convocatoria convocatoria
   */
  deactivateConvocatoria(convocatoria: IConvocatoriaListado): void {
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
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activamos una convocatoria
   * @param convocatoria convocatoria
   */
  activeConvocatoria(convocatoria: IConvocatoriaListado): void {
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
        },
        (error) => {
          this.logger.error(error);
          convocatoria.convocatoria.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(suscription);
  }
}
