import { Component, OnInit, ViewChild } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { ComiteService } from '@core/services/eti/comite.service';
import { TipoConvocatoriaReunionService } from '@core/services/eti/tipo-convocatoria-reunion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { FormGroup, FormControl } from '@angular/forms';
import { IComite } from '@core/models/eti/comite';
import { Observable, zip, of } from 'rxjs';
import { TipoConvocatoriaReunion } from '@core/models/eti/tipo-convocatoria-reunion';
import { startWith, map, switchMap, catchError } from 'rxjs/operators';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DateUtils } from '@core/utils/date-utils';
import { IEvaluacionSolicitante } from '@core/models/eti/evaluacion-solicitante';
import { IPersona } from '@core/models/sgp/persona';
import { TipoEvaluacion } from '@core/models/eti/tipo-evaluacion';
import { TipoEvaluacionService } from '@core/services/eti/tipo-evaluacion.service';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';

const TEXT_USER_TITLE = marker('eti.buscarSolicitante.titulo');
const TEXT_USER_BUTTON = marker('eti.buscarSolicitante.boton.buscar');
const MSG_ERROR = marker('eti.seguimiento.listado.error');
const MSG_ERROR_LOAD_TIPOS_CONVOCATORIA = marker('eti.seguimiento.listado.buscador.tipoConvocatoria.error');


@Component({
  selector: 'sgi-gestion-seguimiento-listado',
  templateUrl: './gestion-seguimiento-listado.component.html',
  styleUrls: ['./gestion-seguimiento-listado.component.scss']
})
export class GestionSeguimientoListadoComponent extends AbstractTablePaginationComponent<IEvaluacionSolicitante> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  evaluaciones$: Observable<IEvaluacionSolicitante[]> = of();

  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;
  datosUsuarioSolicitante: string;
  personaRefSolicitante: string;

  private comiteListado: IComite[];
  private tipoEvaluacionListado: TipoEvaluacion[];
  private tipoConvocatoriaReunionListado: TipoConvocatoriaReunion[];


  filteredComites: Observable<IComite[]>;
  filteredTipoEvaluacion: Observable<TipoEvaluacion[]>;
  filteredTipoConvocatoriaReunion: Observable<TipoConvocatoriaReunion[]>;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly evaluacionesService: EvaluacionService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoEvaluacionService: TipoEvaluacionService,
    private readonly tipoConvocatoriaReunionService: TipoConvocatoriaReunionService,
    protected readonly personaFisicaService: PersonaFisicaService
  ) {

    super(logger, snackBarService, MSG_ERROR);

    this.suscripciones = [];

    this.totalElementos = 0;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(13%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    this.logger.debug(GestionSeguimientoListadoComponent.name, 'ngOnInit()', 'start');

    super.ngOnInit();
    this.formGroup = new FormGroup({
      comite: new FormControl('', []),
      fechaEvaluacionInicio: new FormControl('', []),
      fechaEvaluacionFin: new FormControl('', []),
      referenciaMemoria: new FormControl('', []),
      tipoConvocatoriaReunion: new FormControl('', []),
      solicitante: new FormControl('', []),
      tipoEvaluacion: new FormControl('', [])
    });

    this.loadComites();
    this.loadTipoEvaluacion();
    this.loadConvocatoriasReunion();

    this.logger.debug(GestionSeguimientoListadoComponent.name, 'ngOnInit()', 'end');
  }



  protected createObservable(): Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    this.logger.debug(GestionSeguimientoListadoComponent.name, 'createObservable()', 'start');
    const observable$ = this.evaluacionesService.findSeguimientoMemoria(this.getFindOptions());
    this.logger.debug(GestionSeguimientoListadoComponent.name, 'createObservable()', 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(GestionSeguimientoListadoComponent.name, 'initColumns()', 'start');
    this.displayedColumns = ['memoria.comite.comite', 'tipoEvaluacion', 'fechaDictamen', 'memoria.numReferencia', 'solicitante',
      'dictamen.nombre', 'version', 'acciones'];
    this.logger.debug(GestionSeguimientoListadoComponent.name, 'initColumns()', 'end');
  }

  protected createFilters(): SgiRestFilter[] {

    this.logger.debug(GestionSeguimientoListadoComponent.name, 'createFilters()', 'start');

    const filtro: SgiRestFilter[] = [];
    this.addFiltro(filtro, 'memoria.comite.id',
      SgiRestFilterType.EQUALS, this.formGroup.controls.comite.value.id);

    this.addFiltro(filtro, 'tipoEvaluacion.id',
      SgiRestFilterType.EQUALS, this.formGroup.controls.tipoEvaluacion.value.id);


    if (this.formGroup.controls.fechaEvaluacionInicio) {
      const fechaFilter = DateUtils.getFechaFinDia(this.formGroup.controls.fechaEvaluacionInicio.value);
      this.addFiltro(filtro, 'fechaDictamen',
        SgiRestFilterType.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));

    }

    if (this.formGroup.controls.fechaEvaluacionFin) {
      const fechaFilter = DateUtils.getFechaFinDia(this.formGroup.controls.fechaEvaluacionFin.value);
      this.addFiltro(filtro, 'fechaDictamen',
        SgiRestFilterType.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));

    }

    this.addFiltro(filtro, 'memoria.numReferencia',
      SgiRestFilterType.EQUALS, this.formGroup.controls.referenciaMemoria.value);

    this.addFiltro(filtro, 'convocatoriaReunion.tipoConvocatoriaReunion.id',
      SgiRestFilterType.EQUALS, this.formGroup.controls.tipoConvocatoriaReunion.value.id);


    this.addFiltro(filtro, 'memoria.peticionEvaluacion.personaRef',
      SgiRestFilterType.EQUALS, this.personaRefSolicitante);


    this.logger.debug(GestionSeguimientoListadoComponent.name, 'createFilters()', 'end');
    return filtro;

  }


  protected loadTable(reset?: boolean) {
    this.logger.debug(GestionSeguimientoListadoComponent.name, 'loadTable()', 'start');

    // Do the request with paginator/sort/filter values
    this.evaluaciones$ = this.createObservable().pipe(
      switchMap((response) => {
        // Map response total
        this.totalElementos = response.total;
        // Reset pagination to first page
        if (reset) {
          this.paginator.pageIndex = 0;
        }

        if (response.items) {
          // Solicitantes
          const listObservables: Observable<IEvaluacionSolicitante>[] = [];
          response.items.forEach((evaluacion) => {
            const evaluacion$ = this.personaFisicaService.getInformacionBasica(evaluacion.memoria?.peticionEvaluacion?.personaRef).pipe(
              map((personaInfo) => {
                evaluacion.persona = personaInfo;

                return evaluacion;
              })
            );
            listObservables.push(evaluacion$);
          });

          this.logger.debug(GestionSeguimientoListadoComponent.name, 'loadTable()', 'end');
          return zip(...listObservables);
        } else {
          return of([]);
        }

        // Return the values
        // return response.items;
      }),
    ),
      catchError(() => {
        // On error reset pagination values
        this.paginator.firstPage();
        this.totalElementos = 0;
        this.snackBarService.showError(MSG_ERROR);
        this.logger.debug(GestionSeguimientoListadoComponent.name, 'loadTable()', 'end');
        return of([]);
      });

    this.logger.debug(GestionSeguimientoListadoComponent.name, 'loadTable()', 'end');
  }

  /**
   * Devuelve el nombre de un comité.
   * @param comite comité
   * returns nombre comité
   */
  getComite(comite: IComite): string {

    return comite?.comite;

  }

  /**
   * Devuelve el nombre de un tipo evaluacion.
   * @param tipoEvaluacion tipo de evaluación
   * @returns nombre de un tipo de evaluación
   */
  getTipoEvaluacion(tipoEvaluacion: TipoEvaluacion): string {
    return tipoEvaluacion?.nombre;
  }

  /**
   * Devuelve el nombre de un tipo convocatoria reunión.
   * @param convocatoria tipo convocatoria reunión.
   * returns nombre tipo convocatoria reunión.
   */
  getTipoConvocatoriaReunion(convocatoria: TipoConvocatoriaReunion): string {

    return convocatoria?.nombre;

  }

  /**
   * Recupera un listado de los comités que hay en el sistema.
   */
  loadComites(): void {
    this.logger.debug(GestionSeguimientoListadoComponent.name,
      'loadComites()',
      'start');

    this.suscripciones.push(this.comiteService.findAll().subscribe(
      (response) => {
        this.comiteListado = response.items;

        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterComite(value))
          );
      }));

    this.logger.debug(GestionSeguimientoListadoComponent.name,
      'loadComites()',
      'end');
  }

  /**
   * Recupera un listado de los tipos de evaluacion que hay en el sistema.
   */
  loadTipoEvaluacion(): void {
    this.logger.debug(GestionSeguimientoListadoComponent.name,
      'loadTipoEvaluacion()',
      'start');

    this.suscripciones.push(this.tipoEvaluacionService.findTipoEvaluacionSeguimientoAnualFinal().subscribe(
      (response) => {
        this.tipoEvaluacionListado = response.items;

        this.filteredTipoEvaluacion = this.formGroup.controls.tipoEvaluacion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterTipoEvaluacion(value))
          );
      }));

    this.logger.debug(GestionSeguimientoListadoComponent.name,
      'loadTipoEvaluacion()',
      'end');
  }

  /**
   * Recupera un listado de los tipos convocatoria que hay en el sistema.
   */
  loadConvocatoriasReunion(): void {
    this.logger.debug(GestionSeguimientoListadoComponent.name,
      'loadConvocatoriasReunion()',
      'start');

    this.suscripciones.push(this.tipoConvocatoriaReunionService.findAll().subscribe(
      (response) => {
        this.tipoConvocatoriaReunionListado = response.items;

        this.filteredTipoConvocatoriaReunion = this.formGroup.controls.tipoConvocatoriaReunion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterTipoConvocatoriaReunion(value))
          );
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_LOAD_TIPOS_CONVOCATORIA);
      }
    ));

    this.logger.debug(GestionSeguimientoListadoComponent.name,
      'loadConvocatoriasReunion()',
      'end');
  }


  /**
   * Filtro de campo autocompletable comité.
   * @param value value a filtrar (string o nombre comité).
   * @returns lista de comités filtrados.
   */
  private filterComite(value: string | IComite): IComite[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.comite.toLowerCase();
    }

    return this.comiteListado.filter
      (comite => comite.comite.toLowerCase().includes(filterValue));
  }

  /**
   * Filtro de campo autocompletable tipo evaluación.
   * @param value value a filtrar (string o nombre tipo evaluación).
   * @returns lista de tipo evaluación filtrados.
   */
  private filterTipoEvaluacion(value: string | TipoEvaluacion): TipoEvaluacion[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tipoEvaluacionListado.filter
      (tipoEvaluacion => tipoEvaluacion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Filtro de campo autocompletable tipo convocatoria reunión.
   * @param value value a filtrar (string o nombre tipo convocatoria reunion).
   * @returns lista de tipos de convocatorias filtrados.
   */
  private filterTipoConvocatoriaReunion(value: string | TipoConvocatoriaReunion): TipoConvocatoriaReunion[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tipoConvocatoriaReunionListado.filter
      (tipoConvocatoriaReunion => tipoConvocatoriaReunion.nombre.toLowerCase().includes(filterValue));
  }


  /**
   * Setea el persona seleccionado a través del componente
   * @param persona Persona seleccionada
   */
  public setPersona(persona: IPersona) {
    this.personaRefSolicitante = persona.personaRef;
  }

}
