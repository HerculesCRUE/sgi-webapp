import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { map, startWith } from 'rxjs/operators';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';
import { IComite } from '@core/models/eti/comite';
import { IPersona } from '@core/models/sgp/persona';
import { DialogService } from '@core/services/dialog.service';
import { ComiteService } from '@core/services/eti/comite.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { ROUTE_NAMES } from '@core/route.names';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { TipoEstadoMemoriaService } from '@core/services/eti/tipo-estado-memoria.service';
import { MEMORIAS_ROUTE } from '../memoria-route-names';
import { IMemoria } from '@core/models/eti/memoria';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';

const MSG_BUTTON_SAVE = marker('footer.eti.peticionEvaluacion.crear');
const MSG_ERROR = marker('eti.memoria.listado.error');
const TEXT_USER_TITLE = marker('eti.peticionEvaluacion.listado.buscador.solicitante');
const TEXT_USER_BUTTON = marker('eti.peticionEvaluacion.listado.buscador.buscar.solicitante');
const MSG_ERROR_LISTADO_MEMORIAS = marker('eti.memoria.listado.error');
const MSG_ESTADO_ANTERIOR_OK = marker('eti.memoria.listado.volverEstadoAnterior.ok');
const MSG_ESTADO_ANTERIOR_ERROR = marker('eti.memoria.listado.volverEstadoAnterior.error');
const MSG_RECUPERAR_ESTADO = marker('eti.memoria.listado.volverEstadoAnterior.confirmacion');

@Component({
  selector: 'sgi-memoria-listado-ges',
  templateUrl: './memoria-listado-ges.component.html',
  styleUrls: ['./memoria-listado-ges.component.scss']
})
export class MemoriaListadoGesComponent extends AbstractTablePaginationComponent<IMemoriaPeticionEvaluacion> implements OnInit {
  MEMORIAS_ROUTE = MEMORIAS_ROUTE;
  ROUTE_NAMES = ROUTE_NAMES;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];
  totalElementos: number;

  textoCrear = MSG_BUTTON_SAVE;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;


  memorias$: Observable<IMemoriaPeticionEvaluacion[]>;

  comiteListado: IComite[];
  filteredComites: Observable<IComite[]>;

  estadoMemoriaListado: TipoEstadoMemoria[];
  filteredEstadosMemoria: Observable<TipoEstadoMemoria[]>;


  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;
  personaRef: string;
  datosSolicitante: string;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoEstadoMemoriaService: TipoEstadoMemoriaService,
    private readonly dialogService: DialogService,
    private readonly memoriaService: MemoriaService
  ) {

    super(logger, snackBarService, MSG_ERROR);

    this.totalElementos = 0;

    this.suscripciones = [];

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
    this.logger.debug(MemoriaListadoGesComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();

    this.formGroup = new FormGroup({
      comite: new FormControl('', []),
      titulo: new FormControl('', []),
      numReferencia: new FormControl('', []),
      tipoEstadoMemoria: new FormControl('', [])
    });

    this.loadComites();
    this.loadEstadosMemoria();
    this.logger.debug(MemoriaListadoGesComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IMemoriaPeticionEvaluacion>> {
    this.logger.debug(MemoriaListadoGesComponent.name, 'createObservable()', 'start');
    const observable$ = this.memoriaService.findAll(this.getFindOptions());
    this.logger.debug(MemoriaListadoGesComponent.name, 'createObservable()', 'end');
    return observable$;
  }
  protected initColumns(): void {
    this.logger.debug(MemoriaListadoGesComponent.name, 'initColumns()', 'start');
    this.displayedColumns = ['num_referencia', 'comite', 'estado', 'fechaEvaluacion', 'fechaLimite', 'acciones'];
    this.logger.debug(MemoriaListadoGesComponent.name, 'initColumns()', 'end');
  }

  protected createFilters(): SgiRestFilter[] {

    this.logger.debug(MemoriaListadoGesComponent.name, 'createFilters()', 'start');

    const filtro: SgiRestFilter[] = [];
    this.addFiltro(filtro, 'comite.id', SgiRestFilterType.EQUALS, this.formGroup.controls.comite.value.id);
    this.addFiltro(filtro, 'peticionEvaluacion.titulo', SgiRestFilterType.LIKE, this.formGroup.controls.titulo.value);
    this.addFiltro(filtro, 'numReferencia', SgiRestFilterType.EQUALS, this.formGroup.controls.numReferencia.value);
    this.addFiltro(filtro, 'estadoActual.id', SgiRestFilterType.EQUALS, this.formGroup.controls.tipoEstadoMemoria.value.id);
    this.addFiltro(filtro, 'personaRef', SgiRestFilterType.EQUALS, this.formGroup.controls.personaRef.value);

    this.logger.debug(MemoriaListadoGesComponent.name, 'createFilters()', 'end');

    return filtro;
  }

  protected loadTable(reset?: boolean) {
    this.logger.debug(MemoriaListadoGesComponent.name, 'loadTable()', 'start');
    this.memorias$ = this.getObservableLoadTable(reset);
    this.logger.debug(MemoriaListadoGesComponent.name, 'loadTable()', 'end');

  }


  /**
   * Devuelve el nombre de un comité.
   * @param comite comités
   * returns nombre comité
   */
  getComite(comite: IComite): string {

    return comite?.comite;

  }


  /**
   * Devuelve el nombre de un estado memoria.
   * @param tipoEstadoMemoria tipo estado memoria
   * returns nombre estadoMemoria
   */
  getEstadoMemoria(tipoEstadoMemoria: TipoEstadoMemoria): string {

    return tipoEstadoMemoria?.nombre;

  }

  /**
   * Recupera un listado de los comités que hay en el sistema.
   */
  loadComites(): void {
    this.logger.debug(MemoriaListadoGesComponent.name,
      'getComites()',
      'start');

    const comitesSubscription = this.comiteService.findAll().subscribe(
      (response) => {
        this.comiteListado = response.items;

        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterComite(value))
          );
      });

    this.suscripciones.push(comitesSubscription);

    this.logger.debug(MemoriaListadoGesComponent.name,
      'getComites()',
      'end');
  }

  /**
   * Recupera un listado de los estados memoria que hay en el sistema.
   */
  loadEstadosMemoria(): void {
    this.logger.debug(MemoriaListadoGesComponent.name,
      'getEstadosMemoria()',
      'start');

    const estadosMemoriaSubscription = this.tipoEstadoMemoriaService.findAll().subscribe(
      (response) => {
        this.estadoMemoriaListado = response.items;

        this.filteredEstadosMemoria = this.formGroup.controls.tipoEstadoMemoria.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterEstadoMemoria(value))
          );
      });

    this.suscripciones.push(estadosMemoriaSubscription);

    this.logger.debug(MemoriaListadoGesComponent.name,
      'getEstadosMemoria()',
      'end');
  }

  /**
   * Filtro de campo autocompletable comité.
   * @param value value a filtrar (string o nombre comité).
   * @returns lista de comités filtrados.
   */
  private filterComite(value: string | IComite): IComite[] {
    let filterValue: string;
    if (value === null) {
      value = '';
    }
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.comite.toLowerCase();
    }

    return this.comiteListado.filter
      (comite => comite.comite.toLowerCase().includes(filterValue));
  }

  /**
   * Filtro de campo autocompletable estado memoria.
   * @param value value a filtrar (string o nombre estado memoria).
   * @returns lista de estados memoria filtrados.
   */
  private filterEstadoMemoria(value: string | TipoEstadoMemoria): TipoEstadoMemoria[] {
    let filterValue: string;
    if (value === null) {
      value = '';
    }
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.estadoMemoriaListado.filter
      (estadoMemoria => estadoMemoria.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Setea el persona seleccionado a través del componente
   * @param personaRef referencia del persona seleccionado
   */
  public setUsuario(solicitante: IPersona) {
    this.personaRef = solicitante?.personaRef;
  }


  /**
   * Se recupera el estado anterior de la memoria
   * @param memoria la memoria a reestablecer el estado
   */
  private recuperarEstadoAnteriorMemoria(memoria: IMemoriaPeticionEvaluacion) {
    const recuperarEstadoSubscription = this.memoriaService.recuperarEstadoAnterior(memoria.id).pipe(
      map((response: IMemoria) => {
        if (response) {
          // Si todo ha salido bien se recarga la tabla con el cambio de estado actualizado y el aviso correspondiente
          this.snackBarService.showSuccess(MSG_ESTADO_ANTERIOR_OK);
          this.loadTable(true);
        } else {
          // Si no se puede cambiar de estado se muestra el aviso
          this.snackBarService.showError(MSG_ESTADO_ANTERIOR_ERROR);
        }
      })
    ).subscribe();

    this.suscripciones.push(recuperarEstadoSubscription);
  }

  /**
   * Confirmación para recuperar el estado de la memoria
   * @param memoria la memoria a reestablecer el estado
   */
  public recuperarEstadoAnterior(memoria: IMemoriaPeticionEvaluacion) {
    const dialogServiceSubscription = this.dialogService.showConfirmation(MSG_RECUPERAR_ESTADO).pipe(
      map((aceptado: boolean) => {
        if (aceptado) {
          this.recuperarEstadoAnteriorMemoria(memoria);
        }
        this.logger.debug(MemoriaListadoGesComponent.name,
          `${this.recuperarEstadoAnterior.name}(${memoria})`, 'end');
      })
    ).subscribe();

    this.suscripciones.push(dialogServiceSubscription);
  }

}
