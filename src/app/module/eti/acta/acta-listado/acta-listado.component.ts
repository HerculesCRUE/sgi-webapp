import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Component, OnInit, ViewChild, } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, of, Subscription, } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { map, catchError, startWith, } from 'rxjs/operators';

import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';

import { IComite } from '@core/models/eti/comite';
import { TipoEstadoActa } from '@core/models/eti/tipo-estado-acta';

import { ComiteService } from '@core/services/eti/comite.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { TipoEstadoActaService } from '@core/services/eti/tipo-estado-acta.service';

import { IActaEvaluaciones } from '@core/models/eti/acta-evaluaciones';
import { ActaService } from '@core/services/eti/acta.service';
import { ROUTE_NAMES } from '@core/route.names';
import { Router, ActivatedRoute } from '@angular/router';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { DateUtils } from '@core/utils/date-utils';

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
    protected readonly logger: NGXLogger,
    private readonly actasService: ActaService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoEstadoActaService: TipoEstadoActaService,
    private readonly router: Router,
    private readonly evaluacionService: EvaluacionService,
    private route: ActivatedRoute,
  ) {

    super(logger, snackBarService, MSG_ERROR);

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
    this.logger.debug(ActaListadoComponent.name, 'ngOnInit()', 'start');

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

    this.logger.debug(ActaListadoComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IActaEvaluaciones>> {
    this.logger.debug(ActaListadoComponent.name, 'createObservable()', 'start');
    const observable$ = this.actasService.findActivasWithEvaluaciones(this.getFindOptions());
    this.logger.debug(ActaListadoComponent.name, 'createObservable()', 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(ActaListadoComponent.name, 'initColumns()', 'start');
    this.displayedColumns = ['comite', 'fechaEvaluacion', 'numero', 'convocatoria',
      'numeroIniciales', 'numeroRevisiones', 'numeroTotal', 'estadoActual.nombre', 'acciones'];
    this.logger.debug(ActaListadoComponent.name, 'initColumns()', 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(ActaListadoComponent.name, 'createFilters()', 'start');

    const filtro: SgiRestFilter[] = [];
    this.addFiltro(filtro, 'convocatoriaReunion.comite.id', SgiRestFilterType.EQUALS, this.formGroup.controls.comite.value.id);



    if (this.formGroup.controls.fechaEvaluacionInicio) {
      const fechaFilter = DateUtils.getFechaFinDia(this.formGroup.controls.fechaEvaluacionInicio.value);
      this.addFiltro(filtro, 'convocatoriaReunion.fechaEvaluacion',
        SgiRestFilterType.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));

    }

    if (this.formGroup.controls.fechaEvaluacionFin) {
      const fechaFilter = DateUtils.getFechaFinDia(this.formGroup.controls.fechaEvaluacionFin.value);
      this.addFiltro(filtro, 'convocatoriaReunion.fechaEvaluacion',
        SgiRestFilterType.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));

    }

    this.addFiltro(filtro, 'convocatoriaReunion.numeroActa',
      SgiRestFilterType.EQUALS, this.formGroup.controls.numeroActa.value);

    this.addFiltro(filtro, 'estadoActual.id',
      SgiRestFilterType.EQUALS, this.formGroup.controls.tipoEstadoActa.value);

    this.logger.debug(ActaListadoComponent.name, 'createFilters()', 'end');
    return filtro;
  }

  protected loadTable(reset?: boolean) {
    this.logger.debug(ActaListadoComponent.name, 'loadTable()', 'start');
    this.actas$ = this.getObservableLoadTable(reset);
    this.logger.debug(ActaListadoComponent.name, 'loadTable()', 'end');
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
    this.logger.debug(ActaListadoComponent.name,
      'getComites()',
      'start');

    this.comitesSubscription = this.comiteService.findAll().subscribe(
      (response) => {
        this.comiteListado = response.items;

        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterComite(value))
          );
      });

    this.logger.debug(ActaListadoComponent.name,
      'getComites()',
      'end');
  }

  /**
   * Recupera un listado de los tipos de estados de acta que hay en el sistema.
   */
  getTipoEstadoActas(): void {
    this.logger.debug(ActaListadoComponent.name,
      'getTipoEstadoActa()',
      'start');

    this.tipoEstadoActaSubscription = this.tipoEstadoActaService.findAll().subscribe(
      (response) => {
        this.tipoEstadoActaListado = response.items;

        this.filteredTipoEstadoActa = this.formGroup.controls.tipoEstadoActa.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterTipoEstado(value))
          );
      });

    this.logger.debug(ActaListadoComponent.name,
      'getTipoEstadoActa()',
      'end');
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
    this.logger.debug(ActaListadoComponent.name,
      'finishActa()',
      'start');
    this.finalizarSubscription = this.actasService.finishActa(actaId).subscribe((acta) => {
      this.snackBarService.showSuccess(MSG_FINALIZAR_SUCCESS);
      this.loadTable(false);
    },
      catchError(() => {
        // On error reset pagination values
        this.paginator.firstPage();
        this.totalElementos = 0;
        this.snackBarService.showError(MSG_FINALIZAR_ERROR);
        this.logger.debug(ActaListadoComponent.name, 'loadTable()', 'end');
        return of([]);
      }));


    this.logger.debug(ActaListadoComponent.name,
      'finishActa()',
      'end');

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
