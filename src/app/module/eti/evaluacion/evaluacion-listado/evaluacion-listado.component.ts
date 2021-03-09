import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IComite } from '@core/models/eti/comite';
import { IEvaluacionSolicitante } from '@core/models/eti/evaluacion-solicitante';
import { TipoConvocatoriaReunion } from '@core/models/eti/tipo-convocatoria-reunion';
import { TipoEvaluacion } from '@core/models/eti/tipo-evaluacion';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ComiteService } from '@core/services/eti/comite.service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { TipoConvocatoriaReunionService } from '@core/services/eti/tipo-convocatoria-reunion.service';
import { TipoEvaluacionService } from '@core/services/eti/tipo-evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap, startWith, switchMap } from 'rxjs/operators';

const MSG_ERROR = marker('eti.evaluacion.listado.error');
const MSG_ERROR_LOAD_TIPOS_CONVOCATORIA = marker('eti.evaluacion.listado.buscador.tipoConvocatoria.error');
const TEXT_USER_TITLE = marker('eti.buscarSolicitante.titulo');
const TEXT_USER_BUTTON = marker('eti.buscarSolicitante.boton.buscar');

@Component({
  selector: 'sgi-evaluacion-listado',
  templateUrl: './evaluacion-listado.component.html',
  styleUrls: ['./evaluacion-listado.component.scss']
})
export class EvaluacionListadoComponent extends AbstractTablePaginationComponent<IEvaluacionSolicitante> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];
  totalElementos: number;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  evaluaciones$: Observable<IEvaluacionSolicitante[]> = of();

  private comiteListado: IComite[];
  private tipoEvaluacionListado: TipoEvaluacion[];
  private tipoConvocatoriaReunionListado: TipoConvocatoriaReunion[];

  filteredComites: Observable<IComite[]>;
  filteredTipoEvaluacion: Observable<TipoEvaluacion[]>;
  filteredTipoConvocatoriaReunion: Observable<TipoConvocatoriaReunion[]>;
  buscadorFormGrou: FormGroup;

  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;
  datosUsuarioSolicitante: string;
  personaRefSolicitante: string;

  constructor(
    private readonly logger: NGXLogger,
    private readonly evaluacionesService: EvaluacionService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoEvaluacionService: TipoEvaluacionService,
    private readonly tipoConvocatoriaReunionService: TipoConvocatoriaReunionService,
    protected readonly personaFisicaService: PersonaFisicaService

  ) {

    super(snackBarService, MSG_ERROR);

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

    this.suscripciones = [];

  }

  ngOnInit(): void {
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
    this.loadTipoEvaluaciones();
    this.loadTipoConvocatoriasReunion();
  }



  protected createObservable(): Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    const observable$ = this.evaluacionesService.findAllByMemoriaAndRetrospectivaEnEvaluacion(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.displayedColumns = ['memoria.comite.comite', 'tipoEvaluacion', 'fechaDictamen', 'memoria.numReferencia', 'solicitante',
      'dictamen.nombre', 'version', 'acciones'];
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('memoria.comite.id', SgiRestFilterOperator.EQUALS, controls.comite.value?.id?.toString())
      .and('tipoEvaluacion.id', SgiRestFilterOperator.EQUALS, controls.tipoEvaluacion.value?.id?.toString());
    if (controls.fechaEvaluacionInicio) {
      const fechaFilter = DateUtils.getFechaFinDia(controls.fechaEvaluacionInicio.value);
      filter.and('fechaDictamen',
        SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODate(fechaFilter));
    }
    if (controls.fechaEvaluacionFin) {
      const fechaFilter = DateUtils.getFechaFinDia(controls.fechaEvaluacionFin.value);
      filter.and('fechaDictamen',
        SgiRestFilterOperator.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODate(fechaFilter));
    }
    filter
      .and('memoria.numReferencia', SgiRestFilterOperator.LIKE_ICASE, controls.referenciaMemoria.value)
      .and('convocatoriaReunion.tipoConvocatoriaReunion.id', SgiRestFilterOperator.EQUALS, controls.tipoConvocatoriaReunion.value?.id?.toString())
      .and('memoria.peticionEvaluacion.personaRef', SgiRestFilterOperator.EQUALS, this.personaRefSolicitante);

    return filter;
  }

  protected loadTable(reset?: boolean) {
    this.evaluaciones$ = this.getObservableLoadTable(reset).pipe(
      switchMap((evaluaciones) => {
        return from(evaluaciones).pipe(
          mergeMap(evaluacion => {
            const personaRef = evaluacion.memoria?.peticionEvaluacion?.personaRef;
            if (personaRef) {
              return this.personaFisicaService.getInformacionBasica(personaRef).pipe(
                map(persona => {
                  evaluacion.persona = persona;
                  return evaluacion;
                })
              );
            }
            return of(evaluacion);
          }),
          map(() => evaluaciones)
        );
      })
    );
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
    this.suscripciones.push(this.comiteService.findAll().subscribe(
      (response) => {
        this.comiteListado = response.items;

        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterComite(value))
          );
      }));
  }

  /**
   * Recupera un listado de los tipos de evaluacion que hay en el sistema.
   */
  loadTipoEvaluaciones(): void {
    this.suscripciones.push(this.tipoEvaluacionService.findTipoEvaluacionMemoriaRetrospectiva().subscribe(
      (response) => {
        this.tipoEvaluacionListado = response.items;

        this.filteredTipoEvaluacion = this.formGroup.controls.tipoEvaluacion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterTipoEvaluacion(value))
          );
      }));
  }


  /**
   * Recupera un listado de los tipos convocatoria que hay en el sistema.
   */
  loadTipoConvocatoriasReunion(): void {
    this.suscripciones.push(this.tipoConvocatoriaReunionService.findAll().subscribe(
      (response) => {
        this.tipoConvocatoriaReunionListado = response.items;

        this.filteredTipoConvocatoriaReunion = this.formGroup.controls.tipoConvocatoriaReunion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterTipoConvocatoriaReunion(value))
          );
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_LOAD_TIPOS_CONVOCATORIA);
      }
    ));
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
    this.formGroup.controls.solicitante.setValue(persona.personaRef);
    this.datosUsuarioSolicitante = persona.nombre ? persona.nombre + ' ' + persona.primerApellido + ' ' + persona.segundoApellido : '';
    this.personaRefSolicitante = persona.personaRef;
  }

  /**
   * Clean filters an reload the table
   */
  onClearFilters(): void {
    super.onClearFilters();
    this.setPersona({} as IPersona);
  }

}
