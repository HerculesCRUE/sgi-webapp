import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IComite } from '@core/models/eti/comite';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { TipoConvocatoriaReunion } from '@core/models/eti/tipo-convocatoria-reunion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { DialogService } from '@core/services/dialog.service';
import { ComiteService } from '@core/services/eti/comite.service';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { TipoConvocatoriaReunionService } from '@core/services/eti/tipo-convocatoria-reunion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const MSG_BUTTON_NEW = marker('eti.convocatoriaReunion.listado.nuevaConvocatoriaReunion');
const MSG_ERROR = marker('eti.convocatoriaReunion.listado.error');
const MSG_CONFIRMATION_DELETE = marker('eti.convocatoriaReunion.listado.eliminar');
const MSG_SUCCESS_DELETE = marker('eti.convocatoriaReunion.listado.eliminarConfirmado');

@Component({
  selector: 'sgi-convocatoria-reunion-listado',
  templateUrl: './convocatoria-reunion-listado.component.html',
  styleUrls: ['./convocatoria-reunion-listado.component.scss']
})
export class ConvocatoriaReunionListadoComponent extends AbstractTablePaginationComponent<IConvocatoriaReunion> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;

  FormGroupUtil = FormGroupUtil;

  displayedColumns: string[];
  totalElementos: number;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  textoCrear = MSG_BUTTON_NEW;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  comiteListado: IComite[];
  filteredComites: Observable<IComite[]>;

  tipoConvocatoriaReunionListado: TipoConvocatoriaReunion[];
  filteredTiposConvocatoriaReunion: Observable<TipoConvocatoriaReunion[]>;

  convocatoriaReunion$: Observable<IConvocatoriaReunion[]> = of();
  private dialogSubscription: Subscription;
  private convocatoriaReunionDeleteSubscription: Subscription;
  private comitesSubscription: Subscription;
  private tiposConvocatoriaReunionSubscription: Subscription;

  constructor(
    private readonly convocatoriaReunionService: ConvocatoriaReunionService,
    private readonly dialogService: DialogService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoConvocatoriaReunionService: TipoConvocatoriaReunionService,
    private formBuilder: FormBuilder
  ) {

    super(snackBarService, MSG_ERROR);

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(25%-10px)';
    this.fxFlexProperties.md = '0 1 calc(25%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(15%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';


    this.totalElementos = 0;
  }


  protected createObservable(): Observable<SgiRestListResult<IConvocatoriaReunion>> {
    const observable$ = this.convocatoriaReunionService.findAll(this.getFindOptions());
    return observable$;
  }
  protected initColumns(): void {
    this.displayedColumns = ['comite', 'fechaEvaluacion', 'codigo', 'horaInicio', 'lugar', 'tipoConvocatoriaReunion', 'fechaEnvio', 'acciones'];
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('comite.id', SgiRestFilterOperator.EQUALS, controls.comite.value?.id?.toString())
      .and('tipoConvocatoriaReunion.id', SgiRestFilterOperator.EQUALS, controls.tipoConvocatoriaReunion.value?.id?.toString());
    if (controls.fechaEvaluacionDesde.value) {
      const fechaFilter = DateUtils.getFechaFinDia(controls.fechaEvaluacionDesde.value);
      filter.and('fechaEvaluacion',
        SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));
    }
    if (controls.fechaEvaluacionHasta.value) {
      const fechaFilter = DateUtils.getFechaFinDia(controls.fechaEvaluacionHasta.value);
      filter.and('fechaEvaluacion',
        SgiRestFilterOperator.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODateTime(fechaFilter));
    }

    return filter;
  }


  ngOnInit(): void {
    super.ngOnInit();

    // Inicializa el formulario de busqueda
    this.formGroup = this.formBuilder.group({
      comite: new FormControl('', []),
      tipoConvocatoriaReunion: new FormControl('', []),
      fechaEvaluacionDesde: new FormControl('', []),
      fechaEvaluacionHasta: new FormControl('', [])
    });

    // Recupera los valores de los combos
    this.loadComites();
    this.loadTiposConvocatoriaReunion();
  }


  /**
   * Recupera un listado de los comites que hay en el sistema.
   */
  private loadComites(): void {
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
   * Recupera un listado de los tipos de convocatoria reunion que hay en el sistema.
   */
  private loadTiposConvocatoriaReunion(): void {
    this.tiposConvocatoriaReunionSubscription = this.tipoConvocatoriaReunionService.findAll().subscribe(
      (response) => {
        this.tipoConvocatoriaReunionListado = response.items;

        this.filteredTiposConvocatoriaReunion = this.formGroup.controls.tipoConvocatoriaReunion.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterTipoConvocatoriaReunion(value))
          );
      });
  }

  /**
   * Devuelve el nombre del comite
   * @param comite comite
   *
   * @returns nombre del comite
   */
  getComite(comite: IComite): string {
    return comite?.comite;
  }

  /**
   * Devuelve el nombre del tipo de convocatoria reunion
   * @param tipoConvocatoriaReunion tipo convocatoria reunion
   *
   * @returns nombre del tipo de convocatoria reunion
   */
  getTipoConvocatoriaReunion(tipoConvocatoriaReunion: TipoConvocatoriaReunion): string {
    return tipoConvocatoriaReunion?.nombre;
  }


  /**
   * Filtro de campo autocompletable comite.
   * @param value value a filtrar (string o Comite.
   * @returns lista de comites filtrada.
   */
  private _filterComite(value: string | IComite): IComite[] {
    if (!value) {
      return this.comiteListado;
    }

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
   * Filtro de campo autocompletable tipo convocatoria reunion.
   * @param value value a filtrar (string o TipoConvocatoriaReunion).
   * @returns lista de tipos de convocatoria reunion filtrada.
   */
  private _filterTipoConvocatoriaReunion(value: string | TipoConvocatoriaReunion): TipoConvocatoriaReunion[] {
    if (!value) {
      return this.tipoConvocatoriaReunionListado;
    }

    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tipoConvocatoriaReunionListado.filter
      (tipoConvocatoriaReunion => tipoConvocatoriaReunion.nombre.toLowerCase().includes(filterValue));
  }

  protected loadTable(reset?: boolean) {
    this.convocatoriaReunion$ = this.getObservableLoadTable(reset);
  }

  /**
   * Elimina la convocatoria reunion.
   * @param convocatoriaReunionId id de la convocatoria reunion a eliminar.
   * @param event evento lanzado.
   */
  borrar(convocatoriaReunionId: number, $event: Event): void {
    $event.stopPropagation();
    $event.preventDefault();

    this.dialogSubscription = this.dialogService.showConfirmation(
      MSG_CONFIRMATION_DELETE
    ).subscribe(
      (aceptado) => {
        if (aceptado) {
          this.convocatoriaReunionDeleteSubscription = this.convocatoriaReunionService
            .deleteById(convocatoriaReunionId).pipe(
              map(() => {
                return this.loadTable();
              })
            ).subscribe(() => {
              this.snackBarService.showSuccess(MSG_SUCCESS_DELETE);
            });
        }
        aceptado = false;
      });
  }

  /**
   * Envia la convocatoria reunion.
   * @param convocatoriaReunionId id de la convocatoria reunion a enviar.
   * @param event evento lanzado.
   */
  enviar(convocatoriaReunionId: number, $event: Event): void {
  }
}
