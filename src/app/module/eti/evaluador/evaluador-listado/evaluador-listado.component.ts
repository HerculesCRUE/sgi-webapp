import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IComite } from '@core/models/eti/comite';
import { IEvaluador } from '@core/models/eti/evaluador';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { DialogService } from '@core/services/dialog.service';
import { ComiteService } from '@core/services/eti/comite.service';
import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { BuscarPersonaComponent } from '@shared/buscar-persona/buscar-persona.component';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';







const MSG_BUTTON_SAVE = marker('footer.eti.evaluador.crear');
const MSG_ERROR = marker('eti.evaluador.listado.error');
const TEXT_USER_TITLE = marker('eti.buscarUsuario.titulo');
const TEXT_USER_BUTTON = marker('eti.buscarUsuario.boton.buscar');
const MSG_DELETE = marker('eti.evaluador.listado.eliminar');
const MSG_SUCCESS = marker('eti.evaluador.listado.eliminarConfirmado');

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
  @ViewChild(BuscarPersonaComponent, { static: false }) private buscarPersona: BuscarPersonaComponent;

  evaluadores$: Observable<IEvaluador[]> = of();

  comiteListado: IComite[];
  filteredComites: Observable<IComite[]>;

  textoCrear = MSG_BUTTON_SAVE;
  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;

  personasRef: string[];

  personas$: Observable<IPersona[]> = of();

  constructor(
    private readonly logger: NGXLogger,
    private readonly evaluadoresService: EvaluadorService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly personaFisicaService: PersonaFisicaService,
    private readonly dialogService: DialogService
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
      comite: new FormControl('', []),
      estado: new FormControl('', []),
      solicitante: new FormControl('', [])
    });

    this.getComites();
  }


  protected createObservable(): Observable<SgiRestListResult<IEvaluador>> {
    const observable$ = this.evaluadoresService.findAll(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.displayedColumns = ['nombre', 'identificadorNumero', 'comite', 'cargoComite', 'fechaAlta', 'fechaBaja', 'estado', 'acciones'];
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('comite.id', SgiRestFilterOperator.EQUALS, controls.comite.value?.id?.toString());
    if (controls.estado.value) {
      filter
        .and('fechaBaja', SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODate(new Date()))
        .and('fechaAlta', SgiRestFilterOperator.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODate(new Date()));
    }
    filter.and('personaRef', SgiRestFilterOperator.EQUALS, controls.solicitante.value);

    return filter;
  }



  protected loadTable(reset?: boolean) {
    // Do the request with paginator/sort/filter values
    this.evaluadores$ = this.createObservable().pipe(
      map((response) => {
        // Map response total
        this.totalElementos = response.total;
        // Reset pagination to first page
        if (reset) {
          this.paginator.pageIndex = 0;
        }
        // Return the values
        return this.getDatosEvaluadores(response.items);
      }),
      catchError((error) => {
        this.logger.error(error);
        // On error reset pagination values
        this.paginator.firstPage();
        this.totalElementos = 0;
        this.snackBarService.showError(MSG_ERROR);
        return of([]);
      })
    );
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

  /**
   * Devuelve los datos de persona del evaluador
   * @param evaluador el evaluador
   * returns el evaluador con los datos de persona
   */
  loadDatosUsuario(evaluador: IEvaluador): IEvaluador {
    const personaServiceOneSubscription = this.personaFisicaService.getInformacionBasica(evaluador.personaRef)
      .subscribe(
        (persona: IPersona) => {
          evaluador.nombre = persona.nombre;
          evaluador.primerApellido = persona.primerApellido;
          evaluador.segundoApellido = persona.segundoApellido;
          evaluador.identificadorNumero = persona.identificadorNumero;
          evaluador.identificadorLetra = persona.identificadorLetra;
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR);
        }
      );
    this.suscripciones.push(personaServiceOneSubscription);
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
    $event.stopPropagation();
    $event.preventDefault();

    const dialogServiceSubscriptionGetSubscription = this.dialogService.showConfirmation(MSG_DELETE).subscribe(
      (aceptado: boolean) => {
        if (aceptado) {
          const evaluadorServiceDeleteSubscription = this.evaluadoresService
            .deleteById(evaluadorId)
            .pipe(
              map(() => {
                return this.loadTable();
              })
            ).subscribe(() => {
              this.snackBarService.showSuccess(MSG_SUCCESS);
            });
          this.suscripciones.push(evaluadorServiceDeleteSubscription);
        }
        aceptado = false;
      });
    this.suscripciones.push(dialogServiceSubscriptionGetSubscription);
  }

  /**
   * Setea el persona seleccionado a través del componente
   * @param persona persona seleccionado
   */
  public setUsuario(persona: IPersona) {
    this.formGroup.controls.solicitante.setValue(persona?.personaRef);
  }

  /**
   * Clean filters an reload the table
   */
  onClearFilters(): void {
    super.onClearFilters();
    this.buscarPersona.clear();
  }

}
