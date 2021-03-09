import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { Estado, ESTADO_MAP } from '@core/models/csp/estado-proyecto';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { IPrograma } from '@core/models/csp/programa';
import { IProyecto } from '@core/models/csp/proyecto';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { ROUTE_NAMES } from '@core/route.names';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { ProgramaService } from '@core/services/csp/programa.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { SgiAuthService } from '@sgi/framework/auth';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

const MSG_ERROR = marker('csp.proyecto.listado.error');
const MSG_ERROR_INIT = marker('csp.proyecto.listado.error.cargar');
const MSG_BUTTON_NEW = marker('footer.csp.proyecto.crear');
const MSG_DEACTIVATE = marker('csp.proyecto.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.proyecto.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.proyecto.desactivar.error');
const MSG_REACTIVE = marker('csp.proyecto.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.proyecto.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.proyecto.reactivar.error');

@Component({
  selector: 'sgi-proyecto-listado',
  templateUrl: './proyecto-listado.component.html',
  styleUrls: ['./proyecto-listado.component.scss']
})
export class ProyectoListadoComponent extends AbstractTablePaginationComponent<IProyecto> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;
  textoCrear = MSG_BUTTON_NEW;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  proyecto$: Observable<IProyecto[]>;

  get Estado() {
    return Estado;
  }

  busquedaAvanzada = false;

  private subscriptions: Subscription[] = [];

  private unidadGestionFiltered: IUnidadGestion[] = [];
  unidadesGestion$: Observable<IUnidadGestion[]>;

  private ambitoGeograficoFiltered: ITipoAmbitoGeografico[] = [];
  ambitoGeografico$: Observable<ITipoAmbitoGeografico[]>;

  private planInvestigacionFiltered: IPrograma[] = [];
  planInvestigacion$: Observable<IPrograma[]>;

  private fuenteFinanciacionFiltered: IFuenteFinanciacion[] = [];
  fuenteFinanciacion$: Observable<IFuenteFinanciacion[]>;

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly proyectoService: ProyectoService,
    private readonly dialogService: DialogService,
    public authService: SgiAuthService,
    private unidadGestionService: UnidadGestionService,
    private tipoAmbitoGeograficoService: TipoAmbitoGeograficoService,
    private programaService: ProgramaService,
    private fuenteFinanciacionService: FuenteFinanciacionService
  ) {
    super(snackBarService, MSG_ERROR);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.formGroup = new FormGroup({
      titulo: new FormControl(''),
      acronimo: new FormControl(''),
      estado: new FormControl(''),
      activo: new FormControl('true'),
      unidadGestion: new FormControl('', [IsEntityValidator.isValid()]),
      fechaInicioDesde: new FormControl(''),
      fechaInicioHasta: new FormControl(''),
      fechaFinDesde: new FormControl(''),
      fechaFinHasta: new FormControl(''),
      ambitoGeografico: new FormControl(''),
      responsableProyecto: new FormControl(''),
      miembroEquipo: new FormControl(''),
      socioColaborador: new FormControl(''),
      convocatoria: new FormControl(''),
      entidadConvocante: new FormControl(''),
      planInvestigacion: new FormControl(''),
      entidadFinanciadora: new FormControl(''),
      fuenteFinanciacion: new FormControl('')
    });
    this.loadUnidadesGestion();
    this.loadAmbitoGeografico();
    this.loadPlanInvestigacion();
    this.loadFuenteFinanciacion();
    this.filter = this.createFilter();
  }

  onClearFilters() {
    super.onClearFilters();
    this.formGroup.controls.activo.setValue('true');
    this.onSearch();
  }

  protected createObservable(): Observable<SgiRestListResult<IProyecto>> {
    const observable$ = this.proyectoService.findAll(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['acronimo', 'titulo', 'fechaInicio', 'fechaFin', 'estado', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.proyecto$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('acronimo', SgiRestFilterOperator.LIKE_ICASE, controls.acronimo.value)
      .and('titulo', SgiRestFilterOperator.LIKE_ICASE, controls.titulo.value)
      .and('acronimo', SgiRestFilterOperator.LIKE_ICASE, controls.titulo.value)
      .and('estado.estado', SgiRestFilterOperator.EQUALS, controls.estado.value);
    if (controls.activo.value !== 'todos') {
      filter.and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value);
    }
    filter
      .and('unidadGestionRef', SgiRestFilterOperator.EQUALS, controls.unidadGestion.value?.acronimo)
      .and('fechaInicio', SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaInicioDesde.value))
      .and('fechaInicio', SgiRestFilterOperator.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaInicioHasta.value))
      .and('fechaFin', SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaFinDesde.value))
      .and('fechaFin', SgiRestFilterOperator.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaFinHasta.value))
      .and('ambitoGeografico.id', SgiRestFilterOperator.EQUALS, controls.ambitoGeografico.value?.id?.toString())
      .and('responsableProyecto', SgiRestFilterOperator.EQUALS, controls.responsableProyecto.value?.personaRef)
      .and('equipos.personaRef', SgiRestFilterOperator.EQUALS, controls.miembroEquipo.value?.personaRef)
      .and('socios.empresaRef', SgiRestFilterOperator.EQUALS, controls.socioColaborador.value?.personaRef)
      .and('convocatoria.id', SgiRestFilterOperator.EQUALS, controls.convocatoria.value?.id?.toString())
      .and('entidadesConvocantes.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadConvocante.value?.personaRef)
      .and('planInvestigacion', SgiRestFilterOperator.EQUALS, controls.planInvestigacion.value?.id?.toString())
      .and('entidadesFinanciadoras.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadFinanciadora.value?.personaRef)
      .and('entidadesFinanciadoras.fuenteFinanciacion.id', SgiRestFilterOperator.EQUALS, controls.fuenteFinanciacion.value?.id?.toString());

    return filter;
  }

  /**
   * Desactivar proyecto
   * @param proyecto proyecto
   */
  deactivateProyecto(proyecto: IProyecto): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.proyectoService.desactivar(proyecto.id);
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
   * Activamos una proyecto
   * @param proyecto proyecto
   */
  activateProyecto(proyecto: IProyecto): void {
    const suscription = this.dialogService.showConfirmation(MSG_REACTIVE).pipe(
      switchMap((accept) => {
        if (accept) {
          proyecto.activo = true;
          return this.proyectoService.reactivar(proyecto.id);
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
          proyecto.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(suscription);
  }

  /**
  * Mostrar busqueda avanzada
  */
  toggleBusquedaAvanzada(): void {
    this.busquedaAvanzada = !this.busquedaAvanzada;
  }

  /**
  * Devuelve el nombre de una unidad de gestión.
  * @param unidadGestion unidad de gestión
  * @returns nombre de una unidad de gestión
  */
  getUnidadGestion(unidadGestion?: IUnidadGestion): string | undefined {
    return typeof unidadGestion === 'string' ? unidadGestion : unidadGestion?.nombre;
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
  * Devuelve el nombre de un tipo de ámbito geográfico.
  * @param ambito de un ámbito geográfico
  * @returns nombre de un ámbito geográfico
  */
  getAmbitoGeografico(ambito?: ITipoAmbitoGeografico): string | undefined {
    return typeof ambito === 'string' ? ambito : ambito?.nombre;
  }

  /**
  * Devuelve el nombre de un plan de investigación.
  * @param plan de un plan de investigación.
  * @returns nombre de de un plan de investigación
  */
  getPlanInvestigacion(plan?: IFuenteFinanciacion): string | undefined {
    return typeof plan === 'string' ? plan : plan?.nombre;
  }

  /**
  * Filtra la lista devuelta por el servicio de Unidades de Gestión
  *
  * @param value del input para autocompletar
  */
  private filtroUnidadGestion(value: string): IUnidadGestion[] {
    const filterValue = value.toString().toLowerCase();
    return this.unidadGestionFiltered.filter(unidadGestion => unidadGestion.nombre.toLowerCase().includes(filterValue));
  }

  /**
  * Filtra la lista devuelta por el servicio de Tipos de ámbitos geográficos
  *
  * @param value del input para autocompletar
  */
  private filtroAmbitoGeografico(value: string): ITipoAmbitoGeografico[] {
    const filterValue = value.toString().toLowerCase();
    return this.ambitoGeograficoFiltered.filter(ambitoGeografico => ambitoGeografico.nombre.toLowerCase().includes(filterValue));
  }

  /**
  * Filtra la lista devuelta por el servicio de Planes e Investigación
  *
  * @param value del input para autocompletar
  */
  private filtroPlanInvestigacion(value: string): IPrograma[] {
    const filterValue = value.toString().toLowerCase();
    return this.planInvestigacionFiltered.filter(fuente => fuente.nombre.toLowerCase().includes(filterValue));
  }

  /**
  * Filtra la lista devuelta por el servicio de Fuentes de Financiación
  *
  * @param value del input para autocompletar
  */
  private filtroFuenteFinanciacion(value: string): IFuenteFinanciacion[] {
    const filterValue = value.toString().toLowerCase();
    return this.fuenteFinanciacionFiltered.filter(fuente => fuente.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Cargar unidad gestion
   */
  private loadUnidadesGestion() {
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
  private loadFuenteFinanciacion() {
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
  * Cargar planes de investigación
  */
  private loadPlanInvestigacion() {
    this.suscripciones.push(
      this.programaService.findAllPlan().subscribe(
        (res) => {
          this.planInvestigacionFiltered = res.items;
          this.planInvestigacion$ = this.formGroup.controls.planInvestigacion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroPlanInvestigacion(value))
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
  * Cargar ámbitos geográficos
  */
  private loadAmbitoGeografico() {
    this.suscripciones.push(
      this.tipoAmbitoGeograficoService.findAll().subscribe(
        (res) => {
          this.ambitoGeograficoFiltered = res.items;
          this.ambitoGeografico$ = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroAmbitoGeografico(value))
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

