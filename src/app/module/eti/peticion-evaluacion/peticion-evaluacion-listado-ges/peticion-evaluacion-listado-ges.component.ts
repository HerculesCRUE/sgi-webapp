import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IComite } from '@core/models/eti/comite';
import { IMemoria } from '@core/models/eti/memoria';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ComiteService } from '@core/services/eti/comite.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { TipoEstadoMemoriaService } from '@core/services/eti/tipo-estado-memoria.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestFilter, SgiRestFilterType, SgiRestSortDirection, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of, Subscription } from 'rxjs';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';


const MSG_BUTTON_SAVE = marker('footer.eti.peticionEvaluacion.crear');
const MSG_ERROR = marker('eti.peticionEvaluacion.listado.error');
const TEXT_USER_TITLE = marker('eti.peticionEvaluacion.listado.buscador.solicitante');
const TEXT_USER_BUTTON = marker('eti.peticionEvaluacion.listado.buscador.buscar.solicitante');
const LISTADO_ERROR = marker('eti.peticionEvaluacion.listado.error');

@Component({
  selector: 'sgi-peticion-evaluacion-listado-ges',
  templateUrl: './peticion-evaluacion-listado-ges.component.html',
  styleUrls: ['./peticion-evaluacion-listado-ges.component.scss']
})
export class PeticionEvaluacionListadoGesComponent extends AbstractTablePaginationComponent<IPeticionEvaluacion> implements OnInit {


  ROUTE_NAMES = ROUTE_NAMES;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];
  totalElementos: number;
  filter: SgiRestFilter[];

  datosUsuarioSolicitante: string;

  textoCrear = MSG_BUTTON_SAVE;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  peticionesEvaluacion$: Observable<IPeticionEvaluacion[]> = of();
  memorias$: Observable<IMemoria[]> = of();

  comiteListado: IComite[];
  comitesSubscription: Subscription;
  filteredComites: Observable<IComite[]>;

  estadoMemoriaListado: TipoEstadoMemoria[];
  estadosMemoriaSubscription: Subscription;
  filteredEstadosMemoria: Observable<TipoEstadoMemoria[]>;


  dialogServiceSubscription: Subscription;
  dialogServiceSubscriptionGetSubscription: Subscription;
  peticionEvaluacionServiceDeleteSubscription: Subscription;
  memoriaServiceSubscription: Subscription;
  personaServiceOneSubscritpion: Subscription;

  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;
  personaRef: string;
  datosSolicitante: string;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly peticionesEvaluacionService: PeticionEvaluacionService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoEstadoMemoriaService: TipoEstadoMemoriaService,
    private readonly memoriaService: MemoriaService,
    private readonly personaFisicaService: PersonaFisicaService
  ) {
    super(logger, snackBarService, MSG_ERROR);

    this.totalElementos = 0;

    this.filter = [{
      field: undefined,
      type: SgiRestFilterType.NONE,
      value: '',
    }];

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
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'ngOnInit()', 'start');

    super.ngOnInit();

    this.formGroup = new FormGroup({
      comite: new FormControl('', []),
      titulo: new FormControl('', []),
      codigo: new FormControl('', []),
      tipoEstadoMemoria: new FormControl('', [])
    });

    this.getComites();
    this.getEstadosMemoria();
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IPeticionEvaluacion>> {
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'createObservable()', 'start');
    const observable$ = this.peticionesEvaluacionService.findAll(this.getFindOptions());
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'createObservable()', 'end');
    return observable$;
  }


  protected initColumns(): void {
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'initColumns()', 'start');
    this.displayedColumns = ['solicitante', 'codigo', 'titulo', 'fuenteFinanciacion', 'fechaInicio', 'fechaFin', 'acciones'];
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'initColumns()', 'end');
  }
  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'createFilters()', 'start');
    this.filter = [];
    if (this.formGroup.controls.codigo.value) {
      this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'createFilters()', 'codigo');
      const filterCodigo: SgiRestFilter = {
        field: 'codigo',
        type: SgiRestFilterType.LIKE,
        value: this.formGroup.controls.codigo.value,
      };

      this.filter.push(filterCodigo);

    }

    if (this.formGroup.controls.titulo.value) {
      this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'createFilters()', 'titulo');
      const filterTitulo: SgiRestFilter = {
        field: 'titulo',
        type: SgiRestFilterType.LIKE,
        value: this.formGroup.controls.titulo.value,
      };

      this.filter.push(filterTitulo);

    }

    if (this.personaRef) {
      this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'createFilters()', 'persona ref');
      const filterPersonaRef: SgiRestFilter = {
        field: 'personaRef',
        type: SgiRestFilterType.EQUALS,
        value: this.personaRef,
      };

      this.filter.push(filterPersonaRef);

    }

    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'createFilters()', 'end');
    return this.filter;
  }

  protected loadTable(reset?: boolean) {
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'loadTable()', 'start');
    this.peticionesEvaluacion$ = this.getObservableLoadTable(reset);
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'loadTable()', 'end');
  }

  loadDatosUsuario(peticionesEvaluacion: IPeticionEvaluacion[]): IPeticionEvaluacion[] {

    peticionesEvaluacion.forEach((peticionEvaluacion) => {
      this.personaServiceOneSubscritpion = this.personaFisicaService.getInformacionBasica(peticionEvaluacion.personaRef)
        .subscribe(
          (persona: IPersona) => {
            peticionEvaluacion.nombre = persona.nombre;
            peticionEvaluacion.primerApellido = persona.primerApellido;
            peticionEvaluacion.segundoApellido = persona.segundoApellido;
            peticionEvaluacion.identificadorNumero = persona.identificadorNumero;
            peticionEvaluacion.identificadorLetra = persona.identificadorLetra;
            if (this.personaRef) {
              this.datosSolicitante = persona.nombre + ' ' + persona.primerApellido + ' ' +
                persona.segundoApellido + '(' + persona.identificadorNumero + persona.identificadorLetra + ')';
            }
          },
          () => {
            this.snackBarService.showError(LISTADO_ERROR);
            this.logger.debug(
              PeticionEvaluacionListadoGesComponent.name,
              'loadDatosUsuario()',
              'end'
            );
          }
        );
    });

    return peticionesEvaluacion;

  }

  private filterPeticionEvaluacionByFilters(peticionesEvaluacion: IPeticionEvaluacion[]): IPeticionEvaluacion[] {
    const peticionesEvaluacionByComiteExists: IPeticionEvaluacion[] = new Array();
    this.peticionesEvaluacion$ = of();
    peticionesEvaluacion.forEach((peticionEvaluacion, i) => {
      this.memoriaServiceSubscription = this.memoriaService
        .findAll({
          filters: this.buildFiltersMemoria(peticionEvaluacion.id)
        })
        .subscribe(
          (response) => {
            const memorias: IMemoria[] = response.items;
            if (memorias && memorias.length > 0) {
              if (peticionesEvaluacionByComiteExists.indexOf(peticionEvaluacion) === -1) {
                peticionesEvaluacionByComiteExists.push(peticionEvaluacion);
              }
            }
            if (i === (peticionesEvaluacion.length - 1)) {
              this.peticionesEvaluacion$ = of(peticionesEvaluacionByComiteExists);
            }
          },
          () => {
            this.snackBarService.showError(LISTADO_ERROR);
            this.logger.debug(
              PeticionEvaluacionListadoGesComponent.name,
              'filterPeticionEvaluacionByComite()',
              'end'
            );
          }
        );
    });
    return peticionesEvaluacionByComiteExists;
  }

  private buildFiltersMemoria(idPeticionEvaluacion?: number): SgiRestFilter[] {
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'buildFiltersMemoria()', 'start');

    this.filter = [];
    if (this.formGroup.controls.comite.value) {
      this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'buildFiltersMemoria()', 'comite');
      const filterComite: SgiRestFilter = {
        field: 'comite.id',
        type: SgiRestFilterType.EQUALS,
        value: this.formGroup.controls.comite.value.id,
      };

      this.filter.push(filterComite);

    }

    if (this.formGroup.controls.tipoEstadoMemoria.value) {
      this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'buildFiltersMemoria()', 'estadoMemoria');
      const filterEstadoMemoria: SgiRestFilter = {
        field: 'estadoActual.id',
        type: SgiRestFilterType.EQUALS,
        value: this.formGroup.controls.tipoEstadoMemoria.value.id,
      };

      this.filter.push(filterEstadoMemoria);

    }

    if (this.formGroup.controls.codigo.value) {
      this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'buildFilters()', 'codigo');
      const filterCodigo: SgiRestFilter = {
        field: 'peticionEvaluacion.codigo',
        type: SgiRestFilterType.LIKE,
        value: this.formGroup.controls.codigo.value,
      };

      this.filter.push(filterCodigo);

    }

    if (this.formGroup.controls.titulo.value) {
      this.logger.debug(PeticionEvaluacionListadoGesComponent.name, 'buildFilters()', 'titulo');
      const filterTitulo: SgiRestFilter = {
        field: 'peticionEvaluacion.titulo',
        type: SgiRestFilterType.LIKE,
        value: this.formGroup.controls.titulo.value,
      };

      this.filter.push(filterTitulo);

    }

    if (idPeticionEvaluacion) {
      const filterPeticionEvaluacion: SgiRestFilter = {
        field: 'peticionEvaluacion.id',
        type: SgiRestFilterType.EQUALS,
        value: idPeticionEvaluacion.toString(),
      };
      this.filter.push(filterPeticionEvaluacion);
    }

    return this.filter;
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
  getComites(): void {
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name,
      'getComites()',
      'start');

    this.comitesSubscription = this.comiteService.findAll().subscribe(
      (response) => {
        this.comiteListado = response.items;

        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterComite(value))
          );
      });

    this.logger.debug(PeticionEvaluacionListadoGesComponent.name,
      'getComites()',
      'end');
  }

  /**
   * Recupera un listado de los estados memoria que hay en el sistema.
   */
  getEstadosMemoria(): void {
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name,
      'getEstadosMemoria()',
      'start');

    this.estadosMemoriaSubscription = this.tipoEstadoMemoriaService.findAll().subscribe(
      (response) => {
        this.estadoMemoriaListado = response.items;

        this.filteredEstadosMemoria = this.formGroup.controls.tipoEstadoMemoria.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterEstadoMemoria(value))
          );
      });

    this.logger.debug(PeticionEvaluacionListadoGesComponent.name,
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
   * Load table data
   */
  public onSearch() {
    this.loadTable(true);
  }

  /**
   * Clean filters an reload the table
   */
  public onClearFilters() {

    this.logger.debug(PeticionEvaluacionListadoGesComponent.name,
      'onClearFilters()',
      'start');
    this.filter = [];
    this.formGroup.reset();
    this.personaRef = null;
    this.loadTable(true);
    this.getComites();
    this.getEstadosMemoria();
    this.datosSolicitante = '';
    this.logger.debug(PeticionEvaluacionListadoGesComponent.name,
      'onClearFilters()',
      'end');
  }



}
