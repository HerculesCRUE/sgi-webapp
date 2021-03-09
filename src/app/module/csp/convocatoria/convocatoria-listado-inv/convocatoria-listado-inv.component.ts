import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { TipoFinalidadService } from '@core/services/csp/tipo-finalidad.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http/';
import { NGXLogger } from 'ngx-logger';
import { from, Observable, of } from 'rxjs';
import { map, mergeAll, startWith, switchMap } from 'rxjs/operators';


const MSG_ERROR = marker('csp.convocatoria.listado.error');
const MSG_ERROR_INIT = marker('csp.convocatoria.listado.error.cargar');

interface IConvocatoriaListado {
  convocatoria: IConvocatoria;
  fase: IConvocatoriaFase;
  entidadConvocante: IConvocatoriaEntidadConvocante;
  entidadConvocanteEmpresa: IEmpresaEconomica;
  entidadFinanciadora: IConvocatoriaEntidadFinanciadora;
  entidadFinanciadoraEmpresa: IEmpresaEconomica;
}

@Component({
  selector: 'sgi-convocatoria-listado-inv',
  templateUrl: './convocatoria-listado-inv.component.html',
  styleUrls: ['./convocatoria-listado-inv.component.scss']
})
export class ConvocatoriaListadoInvComponent extends AbstractTablePaginationComponent<IConvocatoriaListado>
  implements OnInit, OnDestroy {
  ROUTE_NAMES = ROUTE_NAMES;
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  convocatorias$: Observable<IConvocatoriaListado[]>;

  busquedaAvanzada = false;

  private finalidadFiltered = [] as ITipoFinalidad[];
  finalidades$: Observable<ITipoFinalidad[]>;

  private tipoAmbitoGeograficoFiltered = [] as ITipoAmbitoGeografico[];
  tipoAmbitosGeograficos$: Observable<ITipoAmbitoGeografico[]>;

  private fuenteFinanciacionFiltered = [] as IFuenteFinanciacion[];
  fuenteFinanciacion$: Observable<IFuenteFinanciacion[]>;

  private areaTematicaFiltered = [] as IAreaTematica[];
  areaTematica$: Observable<IAreaTematica[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    private convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private tipoFinalidadService: TipoFinalidadService,
    private tipoAmbitoGeograficoService: TipoAmbitoGeograficoService,
    private fuenteFinanciacionService: FuenteFinanciacionService,
    private areaTematicaService: AreaTematicaService
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
      abiertoPlazoPresentacionSolicitud: new FormControl(true),
      aplicarFiltro: new FormControl(true),
      finalidad: new FormControl(''),
      ambitoGeografico: new FormControl('', [IsEntityValidator.isValid()]),
      entidadConvocante: new FormControl(''),
      entidadFinanciadora: new FormControl(''),
      fuenteFinanciacion: new FormControl(''),
      areaTematica: new FormControl('', [IsEntityValidator.isValid()]),
    });
    this.loadAmbitosGeograficos();
    this.loadFinalidades();
    this.fuenteFinanciacion();
    this.loadAreasTematica();
    this.filter = this.createFilter();
  }

  protected createObservable(): Observable<SgiRestListResult<IConvocatoriaListado>> {
    const observable$ = this.convocatoriaService.findAllInvestigador(this.getFindOptions()).pipe(
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
      'entidadConvocante', 'entidadFinanciadora',
      'fuenteFinanciacion', 'acciones'
    ];
  }

  protected loadTable(reset?: boolean): void {
    this.convocatorias$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    return new RSQLSgiRestFilter('codigo', SgiRestFilterOperator.LIKE_ICASE, controls.codigo.value)
      .and('titulo', SgiRestFilterOperator.LIKE_ICASE, controls.titulo.value)
      .and('anio', SgiRestFilterOperator.EQUALS, controls.anio.value)
      .and('abiertoPlazoPresentacionSolicitud', SgiRestFilterOperator.EQUALS, controls.abiertoPlazoPresentacionSolicitud.value?.toString())
      .and('finalidad.id', SgiRestFilterOperator.EQUALS, controls.finalidad.value?.id?.toString())
      .and('ambitoGeografico.id', SgiRestFilterOperator.EQUALS, controls.ambitoGeografico.value?.id?.toString())
      .and('convocatoriaEntidadConvocante.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadConvocante.value?.personaRef)
      .and('convocatoriaEntidadFinanciadora.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadFinanciadora.value?.personaRef)
      .and('fuenteFinanciacion.id', SgiRestFilterOperator.EQUALS, controls.fuenteFinanciacion.value?.id?.toString())
      .and('areaTematica.id', SgiRestFilterOperator.EQUALS, controls.areaTematica.value?.id?.toString());
  }

  onClearFilters() {
    this.formGroup.reset();
    this.onSearch();
  }

  /**
   * Cargar areas tematicas
   */
  private loadAreasTematica() {
    this.suscripciones.push(
      this.areaTematicaService.findAll().subscribe(
        (res: SgiRestListResult<IAreaTematica>) => {
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
        (res: SgiRestListResult<IFuenteFinanciacion>) => {
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
   * Cargar ambitos geograficos
   */
  private loadAmbitosGeograficos() {
    this.suscripciones.push(
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
   * Carga finalidades
   */
  private loadFinalidades() {
    this.suscripciones.push(
      this.tipoFinalidadService.findAll().subscribe(
        res => {
          this.finalidadFiltered = res.items;
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
    this.formGroup.controls.abiertoPlazoPresentacionSolicitud.setValue(!this.busquedaAvanzada);
    this.formGroup.controls.aplicarFiltro.setValue(!this.busquedaAvanzada);
    this.onSearch();
  }
}
