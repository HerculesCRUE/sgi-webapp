import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IComite } from '@core/models/eti/comite';
import { IMemoria } from '@core/models/eti/memoria';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ComiteService } from '@core/services/eti/comite.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { TipoEstadoMemoriaService } from '@core/services/eti/tipo-estado-memoria.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { BuscarPersonaComponent } from '@shared/buscar-persona/buscar-persona.component';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';


const MSG_BUTTON_SAVE = marker('footer.eti.peticionEvaluacion.crear');
const MSG_ERROR = marker('eti.peticionEvaluacion.listado.error');
const TEXT_USER_TITLE = marker('eti.peticionEvaluacion.listado.buscador.solicitante');
const TEXT_USER_BUTTON = marker('eti.peticionEvaluacion.listado.buscador.buscar.solicitante');
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

  textoCrear = MSG_BUTTON_SAVE;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(BuscarPersonaComponent, { static: false }) private buscarPersona: BuscarPersonaComponent;

  peticionesEvaluacion$: Observable<IPeticionEvaluacion[]> = of();
  memorias$: Observable<IMemoria[]> = of();

  comiteListado: IComite[];
  filteredComites: Observable<IComite[]>;

  estadoMemoriaListado: TipoEstadoMemoria[];
  filteredEstadosMemoria: Observable<TipoEstadoMemoria[]>;

  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;

  constructor(
    private readonly logger: NGXLogger,
    private readonly peticionesEvaluacionService: PeticionEvaluacionService,
    protected readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly tipoEstadoMemoriaService: TipoEstadoMemoriaService,
    private readonly personaFisicaService: PersonaFisicaService
  ) {
    super(snackBarService, MSG_ERROR);

    this.totalElementos = 0;

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
      titulo: new FormControl('', []),
      codigo: new FormControl('', []),
      tipoEstadoMemoria: new FormControl('', []),
      solicitante: new FormControl('', [])
    });

    this.getComites();
    this.getEstadosMemoria();
  }

  protected createObservable(): Observable<SgiRestListResult<IPeticionEvaluacion>> {
    return this.peticionesEvaluacionService.findAll(this.getFindOptions()).pipe(
      map((response) => {
        // Return the values
        return response;
      }),
      switchMap((response) => {
        if (!response.items || response.items.length === 0) {
          return of({} as SgiRestListResult<IPeticionEvaluacion>);
        }
        const personaRefsEvaluadores = new Set<string>();

        response.items.forEach((peticionEvaluacion: IPeticionEvaluacion) => {
          personaRefsEvaluadores.add(peticionEvaluacion?.personaRef);
        });

        const personaSubscription = this.personaFisicaService.findByPersonasRefs([...personaRefsEvaluadores]).subscribe((result) => {
          const personas = result.items;
          response.items.forEach((peticionEvaluacion: IPeticionEvaluacion) => {
            const datosPersona = personas.find((persona) =>
              peticionEvaluacion.personaRef === persona.personaRef);
            peticionEvaluacion.nombre = datosPersona?.nombre;
            peticionEvaluacion.primerApellido = datosPersona?.primerApellido;
            peticionEvaluacion.segundoApellido = datosPersona?.segundoApellido;
          });
        });
        this.suscripciones.push(personaSubscription);
        let peticionesListado: SgiRestListResult<IPeticionEvaluacion>;
        return of(peticionesListado = {
          page: response.page,
          total: response.total,
          items: response.items
        });
      }),
      catchError((error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR);
        return of({} as SgiRestListResult<IPeticionEvaluacion>);
      })
    );
  }

  protected initColumns(): void {
    this.displayedColumns = ['solicitante', 'codigo', 'titulo', 'fuenteFinanciacion', 'fechaInicio', 'fechaFin', 'acciones'];
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    return new RSQLSgiRestFilter('peticionEvaluacion.codigo', SgiRestFilterOperator.LIKE_ICASE, controls.codigo.value)
      .and('peticionEvaluacion.titulo', SgiRestFilterOperator.LIKE_ICASE, controls.titulo.value)
      .and('comite.id', SgiRestFilterOperator.EQUALS, controls.comite.value?.id?.toString())
      .and('estadoActual.id', SgiRestFilterOperator.EQUALS, controls.tipoEstadoMemoria.value?.id?.toString())
      .and('peticionEvaluacion.personaRef', SgiRestFilterOperator.EQUALS, controls.solicitante.value);
  }

  protected loadTable(reset?: boolean) {
    this.peticionesEvaluacion$ = this.getObservableLoadTable(reset);
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
   * Recupera un listado de los estados memoria que hay en el sistema.
   */
  getEstadosMemoria(): void {
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
   * @param solicitante persona seleccionado
   */
  public setUsuario(solicitante: IPersona) {
    this.formGroup.controls.solicitante.setValue(solicitante.personaRef);
  }

  /**
   * Clean filters an reload the table
   */
  public onClearFilters() {
    super.onClearFilters();
    this.buscarPersona.clear();
  }
}
