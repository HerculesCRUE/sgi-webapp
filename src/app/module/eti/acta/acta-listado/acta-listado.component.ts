import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IActaEvaluaciones } from '@core/models/eti/acta-evaluaciones';
import { IComite } from '@core/models/eti/comite';
import { TipoEstadoActa } from '@core/models/eti/tipo-estado-acta';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ActaService } from '@core/services/eti/acta.service';
import { ComiteService } from '@core/services/eti/comite.service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { TipoEstadoActaService } from '@core/services/eti/tipo-estado-acta.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';






const MSG_BUTTON_NEW = marker('footer.eti.acta.crear');
const MSG_ERROR = marker('eti.acta.listado.error');
const MSG_FINALIZAR_ERROR = marker('eti.acta.listado.finalizar.error');
const MSG_FINALIZAR_SUCCESS = marker('eti.acta.listado.finalizar.correcto');

@Component({
  selector: 'sgi-acta-listado',
  templateUrl: './acta-listado.component.html',
  styleUrls: ['./acta-listado.component.scss']
})
export class ActaListadoComponent extends AbstractTablePaginationComponent<IActaEvaluaciones> implements OnInit {

  ROUTE_NAMES = ROUTE_NAMES;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  actas$: Observable<IActaEvaluaciones[]> = of();

  comiteListado: IComite[];
  comitesSubscription: Subscription;
  filteredComites: Observable<IComite[]>;

  tipoEstadoActaListado: TipoEstadoActa[];
  tipoEstadoActaSubscription: Subscription;
  filteredTipoEstadoActa: Observable<TipoEstadoActa[]>;

  finalizarSubscription: Subscription;

  textoCrear = MSG_BUTTON_NEW;

  constructor(
    private readonly logger: NGXLogger,
    private readonly actasService: ActaService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoEstadoActaService: TipoEstadoActaService,
    private readonly router: Router,
    private readonly evaluacionService: EvaluacionService,
    private route: ActivatedRoute,
  ) {

    super(snackBarService, MSG_ERROR);

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(17%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }



  ngOnInit(): void {
    super.ngOnInit();
    this.formGroup = new FormGroup({
      comite: new FormControl('', []),
      fechaEvaluacionInicio: new FormControl('', []),
      fechaEvaluacionFin: new FormControl('', []),
      numeroActa: new FormControl('', []),
      tipoEstadoActa: new FormControl('', [])
    });

    this.getComites();

    this.getTipoEstadoActas();
  }

  protected createObservable(): Observable<SgiRestListResult<IActaEvaluaciones>> {
    const observable$ = this.actasService.findActivasWithEvaluaciones(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.displayedColumns = ['convocatoriaReunion.comite', 'convocatoriaReunion.fechaEvaluacion', 'numero', 'convocatoriaReunion.tipoConvocatoriaReunion',
      'numeroIniciales', 'numeroRevisiones', 'numeroTotal', 'estadoActual.nombre', 'acciones'];
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('convocatoriaReunion.comite.id', SgiRestFilterOperator.EQUALS, controls.comite.value?.id?.toString());
    if (controls.fechaEvaluacionInicio) {
      const fechaFilter = DateUtils.getFechaFinDia(controls.fechaEvaluacionInicio.value);
      filter.and('convocatoriaReunion.fechaEvaluacion',
        SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));
    }
    if (controls.fechaEvaluacionFin) {
      const fechaFilter = DateUtils.getFechaFinDia(controls.fechaEvaluacionFin.value);
      filter.and('convocatoriaReunion.fechaEvaluacion',
        SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));
    }
    filter
      .and('convocatoriaReunion.numeroActa', SgiRestFilterOperator.EQUALS, controls.numeroActa?.value.toString())
      .and('estadoActual.id', SgiRestFilterOperator.EQUALS, controls.tipoEstadoActa.value?.id?.toString());

    return filter;
  }

  protected loadTable(reset?: boolean) {
    this.actas$ = this.getObservableLoadTable(reset);
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
   * Devuelve el nombre de un tipo estado acta.
   * @param estado tipo estado acta
   * returns nombre tipo estado acta
   */
  getTipoEstadoActa(estado: TipoEstadoActa): string {
    return estado?.nombre;
  }

  /**
   * Recupera un listado de los comités que hay en el sistema.
   */
  getComites(): void {
    this.comitesSubscription = this.comiteService.findAll().subscribe(
      (response) => {
        this.comiteListado = response.items;

        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterComite(value))
          );
      });
  }

  /**
   * Recupera un listado de los tipos de estados de acta que hay en el sistema.
   */
  getTipoEstadoActas(): void {
    this.tipoEstadoActaSubscription = this.tipoEstadoActaService.findAll().subscribe(
      (response) => {
        this.tipoEstadoActaListado = response.items;

        this.filteredTipoEstadoActa = this.formGroup.controls.tipoEstadoActa.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterTipoEstado(value))
          );
      });
  }


  /**
   * Filtro de campo autocompletable comité.
   * @param value value a filtrar (string o nombre comité).
   * @returns lista de comités filtrados.
   */
  private _filterComite(value: string | IComite): IComite[] {
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
   * Filtro de campo autocompletable tipo estado acta.
   * @param value value a filtrar (string o nombre tipo estado acta).
   * @returns lista de tipos de estados filtrados.
   */
  private _filterTipoEstado(value: string | TipoEstadoActa): TipoEstadoActa[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tipoEstadoActaListado.filter
      (tipoEstadoActa => tipoEstadoActa.nombre.toLowerCase().includes(filterValue));
  }


  /**
   * Finaliza el acta con el id recibido.
   * @param actaId id del acta a finalizar.
   */
  finishActa(actaId: number) {
    this.finalizarSubscription = this.actasService.finishActa(actaId).subscribe((acta) => {
      this.snackBarService.showSuccess(MSG_FINALIZAR_SUCCESS);
      this.loadTable(false);
    },
      catchError((error) => {
        this.logger.error(error);
        // On error reset pagination values
        this.paginator.firstPage();
        this.totalElementos = 0;
        this.snackBarService.showError(MSG_FINALIZAR_ERROR);
        return of([]);
      }));
  }

  /**
   * Comprueba si una acta se encuentra en estado finalizada.
   * @param acta acta a comprobar.
   * @return indicador de si el acta se encuentra finalizada.
   */
  isFinalizada(acta: IActaEvaluaciones): boolean {
    return acta.estadoActa.id === 2;
  }

  /**
   * Comprueba si una acta puede ser finalizado.
   * @param acta acta a comprobar.
   * @return indicador de si se puede finalizar el acta.
   */
  hasFinalizarActa(acta: IActaEvaluaciones): boolean {
    return acta.estadoActa.id === 1 && acta.numEvaluacionesNoEvaluadas === 0;
  }

}
