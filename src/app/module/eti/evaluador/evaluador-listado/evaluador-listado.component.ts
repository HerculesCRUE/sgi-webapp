import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, of, merge, Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

import { SgiRestFilter, SgiRestFilterType, SgiRestSortDirection, SgiRestListResult } from '@sgi/framework/http';
import { tap, map, catchError, startWith } from 'rxjs/operators';

import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';

import { IEvaluador } from '@core/models/eti/evaluador';
import { IComite } from '@core/models/eti/comite';
import { IPersona } from '@core/models/sgp/persona';
import { DialogService } from '@core/services/dialog.service';
import { ComiteService } from '@core/services/eti/comite.service';
import { SnackBarService } from '@core/services/snack-bar.service';

import { DateUtils } from '@core/utils/date-utils';
import { ROUTE_NAMES } from '@core/route.names';

import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { PersonaService } from '@core/services/sgp/persona.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';


const MSG_BUTTON_SAVE = marker('footer.eti.evaluador.crear');
const MSG_ERROR = marker('eti.evaluador.listado.error');
const TEXT_USER_TITLE = marker('eti.buscarUsuario.titulo');
const TEXT_USER_BUTTON = marker('eti.buscarUsuario.boton.buscar');


@Component({
  selector: 'sgi-evaluador-listado',
  templateUrl: './evaluador-listado.component.html',
  styleUrls: ['./evaluador-listado.component.scss']
})
export class EvaluadorListadoComponent extends AbstractTablePaginationComponent<IEvaluador> implements OnInit {

  ROUTE_NAMES = ROUTE_NAMES;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  evaluadores$: Observable<IEvaluador[]> = of();

  comiteListado: IComite[];
  comitesSubscription: Subscription;
  filteredComites: Observable<IComite[]>;

  dialogServiceSubscription: Subscription;
  dialogServiceSubscriptionGetSubscription: Subscription;
  evaluadorServiceDeleteSubscription: Subscription;

  textoCrear = MSG_BUTTON_SAVE;
  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;
  datosUsuarioEvaluador: string;
  personaRef: string;

  personaServiceOneSubscritpion: Subscription;

  personasRef: string[];

  personas$: Observable<IPersona[]> = of();

  constructor(
    protected readonly logger: NGXLogger,
    private readonly evaluadoresService: EvaluadorService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly personaService: PersonaService,
    private readonly personaFisicaService: PersonaFisicaService,
    private readonly dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
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
    this.logger.debug(EvaluadorListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      comite: new FormControl('', []),
      estado: new FormControl('', [])
    });

    this.getComites();

    this.logger.debug(EvaluadorListadoComponent.name, 'ngOnInit()', 'end');
  }


  protected createObservable(): Observable<SgiRestListResult<IEvaluador>> {
    this.logger.debug(EvaluadorListadoComponent.name, 'createObservable()', 'start');
    const observable$ = this.evaluadoresService.findAll(this.getFindOptions());
    this.logger.debug(EvaluadorListadoComponent.name, 'createObservable()', 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(EvaluadorListadoComponent.name, 'initColumns()', 'start');
    this.displayedColumns = ['nombre', 'identificadorNumero', 'comite', 'cargoComite', 'fechaAlta', 'fechaBaja', 'activo', 'acciones'];
    this.logger.debug(EvaluadorListadoComponent.name, 'initColumns()', 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(EvaluadorListadoComponent.name, 'createFilters()', 'start');

    const filtro: SgiRestFilter[] = [];

    this.addFiltro(filtro, 'comite.id', SgiRestFilterType.EQUALS, this.formGroup.controls.comite.value.id);

    if (this.formGroup.controls.estado.value) {
      this.addFiltro(filtro, 'fechaBaja', SgiRestFilterType.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODate(new Date()));
      this.addFiltro(filtro, 'fechaAlta', SgiRestFilterType.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODate(new Date()));

    }

    this.addFiltro(filtro, 'personaRef', SgiRestFilterType.EQUALS, this.personaRef);


    this.logger.debug(EvaluadorListadoComponent.name, 'createFilters()', 'end');
    return filtro;
  }



  protected loadTable(reset?: boolean) {
    this.logger.debug(EvaluadorListadoComponent.name, 'loadTable()', 'start');
    // Do the request with paginator/sort/filter values
    this.evaluadores$ = this.createObservable().pipe(
      map((response) => {
        // Map response total
        this.totalElementos = response.total;
        // Reset pagination to first page
        if (reset) {
          this.paginator.pageIndex = 0;
        }
        this.logger.debug(EvaluadorListadoComponent.name, 'loadTable()', 'end');
        // Return the values
        return this.getDatosEvaluadores(response.items);
      }),
      catchError(() => {
        // On error reset pagination values
        this.paginator.firstPage();
        this.totalElementos = 0;
        this.snackBarService.showError('eti.evaluador.listado.error');
        this.logger.debug(EvaluadorListadoComponent.name, 'loadTable()', 'end');
        return of([]);
      })
    );
    this.logger.debug(EvaluadorListadoComponent.name, 'loadTable()', 'end');
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
   * Devuelve los datos rellenos de evaluadores
   * @param evaluadores el listado de evaluadores
   * returns los evaluadores con todos sus datos
   */
  getDatosEvaluadores(evaluadores: IEvaluador[]): IEvaluador[] {
    this.personasRef = [];
    evaluadores.forEach((evaluador) => {

      if ((evaluador.fechaAlta != null && new Date(evaluador.fechaAlta) <= new Date()) &&
        ((evaluador.fechaBaja != null && new Date(evaluador.fechaBaja) >= new Date()) || (evaluador.fechaBaja == null))) {
        evaluador.activo = true;
      } else {
        evaluador.activo = false;
      }

      if (evaluador.personaRef && evaluador.personaRef !== '') {
        this.personasRef.push(evaluador.personaRef);
      }

      // cambiar en futuro pasando las referencias de las personas
      evaluador = this.loadDatosUsuario(evaluador);
    });
    return evaluadores;
  }

  private buildFilterPersonasRef(): SgiRestFilter[] {
    this.logger.debug(EvaluadorListadoComponent.name, 'buildFilterPersonasRef()', 'start');

    this.filter = [];
    if (this.personasRef) {
      const filterPersonaRef: SgiRestFilter = {
        field: 'personaRefs',
        type: SgiRestFilterType.EQUALS,
        value: this.personasRef.toString(),
      };

      this.filter.push(filterPersonaRef);
    }
    this.logger.debug(EvaluadorListadoComponent.name, 'buildFilterPersonasRef()', 'end');
    return this.filter;
  }

  /**
   * Devuelve los datos de persona del evaluador
   * @param evaluador el evaluador
   * returns el evaluador con los datos de persona
   */
  loadDatosUsuario(evaluador: IEvaluador): IEvaluador {
    this.personaServiceOneSubscritpion = this.personaFisicaService.getInformacionBasica(evaluador.personaRef)
      .subscribe(
        (persona: IPersona) => {
          evaluador.nombre = persona.nombre;
          evaluador.primerApellido = persona.primerApellido;
          evaluador.segundoApellido = persona.segundoApellido;
          evaluador.identificadorNumero = persona.identificadorNumero;
          evaluador.identificadorLetra = persona.identificadorLetra;
        },
        () => {
          this.snackBarService.showError('eti.evaluador.actualizar.no-encontrado');
          this.logger.debug(
            EvaluadorListadoComponent.name,
            'loadDatosUsuario()',
            'end'
          );
        }
      );
    return evaluador;
  }

  /**
   * Devuelve si el estado es activo o inactivo.
   * @param estado estado activo/inactivo
   * returns activo o inactivo
   */
  getEstado(estado: boolean): boolean {

    return estado;
  }

  /**
   * Recupera un listado de los comités que hay en el sistema.
   */
  getComites(): void {
    this.logger.debug(EvaluadorListadoComponent.name,
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

    this.logger.debug(EvaluadorListadoComponent.name,
      'getComites()',
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
   * Elimina el evaluador con el id recibido por parametro.
   * @param evaluadorId id evaluador
   * @param event evento lanzado
   */
  borrar(evaluadorId: number, $event: Event): void {
    this.logger.debug(EvaluadorListadoComponent.name,
      'borrar(evaluadorId: number, $event: Event) - start');

    $event.stopPropagation();
    $event.preventDefault();

    this.dialogServiceSubscriptionGetSubscription = this.dialogService.showConfirmation(
      'eti.evaluador.listado.eliminar'
    ).subscribe(
      (aceptado: boolean) => {
        if (aceptado) {
          this.evaluadorServiceDeleteSubscription = this.evaluadoresService
            .deleteById(evaluadorId)
            .pipe(
              map(() => {
                return this.loadTable();
              })
            ).subscribe(() => {
              this.snackBarService.showSuccess('eti.evaluador.listado.eliminarConfirmado');
            });
        }
        aceptado = false;
      });

    this.logger.debug(EvaluadorListadoComponent.name,
      'borrar(evaluadorId: number, $event: Event) - end');
  }

  /**
   * Setea el persona seleccionado a través del componente
   * @param persona persona seleccionado
   */
  public setUsuario(persona: IPersona) {
    this.personaRef = persona ? persona.personaRef : undefined;
  }



}
