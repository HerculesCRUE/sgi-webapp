import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IComite } from '@core/models/eti/comite';
import { IMemoria } from '@core/models/eti/memoria';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { DialogService } from '@core/services/dialog.service';
import { ComiteService } from '@core/services/eti/comite.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestFilter, SgiRestFilterType, SgiRestSortDirection } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of, Subscription } from 'rxjs';
import { catchError, map, startWith, tap } from 'rxjs/operators';


const MSG_FOOTER = marker('eti.peticionEvaluacion.listado.nuevaPeticionEvaluacion');
const LISTADO_ERROR = marker('eti.peticionEvaluacion.listado.error');

@Component({
  selector: 'sgi-peticion-evaluacion-listado-inv',
  templateUrl: './peticion-evaluacion-listado-inv.component.html',
  styleUrls: ['./peticion-evaluacion-listado-inv.component.scss']
})
export class PeticionEvaluacionListadoInvComponent implements AfterViewInit, OnInit, OnDestroy {

  ROUTE_NAMES = ROUTE_NAMES;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];
  elementosPagina: number[];
  totalElementos: number;
  filter: SgiRestFilter[];

  textoCrear = MSG_FOOTER;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  peticionesEvaluacion$: Observable<IPeticionEvaluacion[]> = of();
  memorias$: Observable<IMemoria[]> = of();

  comiteListado: IComite[];
  comitesSubscription: Subscription;
  filteredComites: Observable<IComite[]>;

  buscadorFormGroup: FormGroup;

  dialogServiceSubscription: Subscription;
  dialogServiceSubscriptionGetSubscription: Subscription;
  peticionEvaluacionServiceDeleteSubscription: Subscription;
  memoriaServiceSubscription: Subscription;


  constructor(
    private readonly logger: NGXLogger,
    private readonly peticionesEvaluacionService: PeticionEvaluacionService,
    private readonly snackBarService: SnackBarService,
    private readonly comiteService: ComiteService,
    private readonly dialogService: DialogService,
    private readonly memoriaService: MemoriaService
  ) {
    this.displayedColumns = ['codigo', 'titulo', 'fuenteFinanciacion', 'fechaInicio', 'fechaFin', 'acciones'];
    this.elementosPagina = [5, 10, 25, 100];
    this.totalElementos = 0;

    this.filter = [{
      field: undefined,
      type: SgiRestFilterType.NONE,
      value: '',
    }];

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
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'ngOnInit()', 'start');

    this.buscadorFormGroup = new FormGroup({
      comite: new FormControl('', []),
      titulo: new FormControl('', []),
      codigo: new FormControl('', [])
    });

    this.getComites();

    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'ngOnInit()', 'end');
  }

  ngAfterViewInit(): void {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'ngAfterViewInit()', 'start');

    // Merge events that trigger load table data
    merge(
      // Link pageChange event to fire new request
      this.paginator.page,
      // Link sortChange event to fire new request
      this.sort.sortChange
    )
      .pipe(
        tap(() => {
          // Load table
          this.loadTable();
        })
      )
      .subscribe();
    // First load
    this.loadTable();

    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'ngAfterViewInit()', 'end');
  }

  private async loadTable(reset?: boolean) {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'loadTable()', 'start');
    // si el usuario tiene asignada una memoria quiere decir que es responsable de memoria,
    // se cargarán las peticiones de evaluación relacionadas a la memoria
    if (!this.loadTableResponsable(reset)) {
      // si el usuario no tiene asignada una memoria cargaremos las peticiones de evaluación creadas por él mismo
      this.loadTableCreador(reset);
    }
  }

  private loadTableResponsable(reset?: boolean): boolean {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'loadTableResponsable()', 'start');
    let responsable = false;
    const peticionesEvaluacionByComiteExists: IPeticionEvaluacion[] = new Array();
    // Do the request with paginator/sort/filter values
    this.memoriaServiceSubscription = this.memoriaService
      .findAllByPersonaRef({
        filters: this.buildFiltersMemoria()
      })
      .subscribe(
        (response) => {
          const memorias: IMemoria[] = response.items;
          if (memorias) {
            memorias.forEach((m, i) => {
              peticionesEvaluacionByComiteExists.push(m.peticionEvaluacion);
              if (i === (memorias.length - 1)) {
                this.peticionesEvaluacion$ = of(peticionesEvaluacionByComiteExists);
              }
            });
            responsable = true;
          }
        },
        () => {
          this.snackBarService.showError(LISTADO_ERROR);
          this.logger.debug(
            PeticionEvaluacionListadoInvComponent.name,
            'loadTableResponsable()',
            'end'
          );
        }
      );

    return responsable;
  }

  private loadTableCreador(reset?: boolean) {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'loadTableCreador()', 'start');
    // Do the request with paginator/sort/filter values
    this.peticionesEvaluacion$ = this.peticionesEvaluacionService
      .findAllByPersonaRef({
        page: {
          index: reset ? 0 : this.paginator.pageIndex,
          size: this.paginator.pageSize
        },
        sort: {
          direction: SgiRestSortDirection.fromSortDirection(this.sort.direction),
          field: this.sort.active
        },
        filters: this.buildFilters()
      })
      .pipe(
        map((response) => {
          // Map response total
          this.totalElementos = response.total;
          // Reset pagination to first page
          if (reset) {
            this.paginator.pageIndex = 0;
          }
          this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'loadTableCreador()', 'end');

          if (this.buscadorFormGroup.controls.comite.value) {
            this.filterPeticionEvaluacionByComite(response.items, this.buscadorFormGroup.controls.comite.value);
          }

          // Return the values
          return response.items;
        }),
        catchError(() => {
          // On error reset pagination values
          this.paginator.firstPage();
          this.totalElementos = 0;
          this.snackBarService.showError(LISTADO_ERROR);
          this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'loadTableCreador()', 'end');
          return of([]);
        })
      );
  }

  private filterPeticionEvaluacionByComite(peticionesEvaluacion: IPeticionEvaluacion[], comite: string) {
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
            if (memorias.length > 0) {
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
              PeticionEvaluacionListadoInvComponent.name,
              'filterPeticionEvaluacionByComite()',
              'end'
            );
          }
        );
    });
  }

  private buildFiltersMemoria(idPeticionEvaluacion?: number): SgiRestFilter[] {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFiltersMemoria()', 'start');

    this.filter = [];
    if (this.buscadorFormGroup.controls.comite.value) {
      this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFiltersMemoria()', 'comite');
      const filterComite: SgiRestFilter = {
        field: 'comite.id',
        type: SgiRestFilterType.EQUALS,
        value: this.buscadorFormGroup.controls.comite.value.id,
      };

      this.filter.push(filterComite);

    }

    if (this.buscadorFormGroup.controls.codigo.value) {
      this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFilters()', 'codigo');
      const filterCodigo: SgiRestFilter = {
        field: 'peticionEvaluacion.codigo',
        type: SgiRestFilterType.LIKE,
        value: this.buscadorFormGroup.controls.codigo.value,
      };

      this.filter.push(filterCodigo);

    }

    if (this.buscadorFormGroup.controls.titulo.value) {
      this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFilters()', 'titulo');
      const filterTitulo: SgiRestFilter = {
        field: 'peticionEvaluacion.titulo',
        type: SgiRestFilterType.LIKE,
        value: this.buscadorFormGroup.controls.titulo.value,
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

  private buildFilters(): SgiRestFilter[] {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFilters()', 'start');
    this.filter = [];
    if (this.buscadorFormGroup.controls.codigo.value) {
      this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFilters()', 'codigo');
      const filterCodigo: SgiRestFilter = {
        field: 'codigo',
        type: SgiRestFilterType.LIKE,
        value: this.buscadorFormGroup.controls.codigo.value,
      };

      this.filter.push(filterCodigo);

    }

    if (this.buscadorFormGroup.controls.titulo.value) {
      this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFilters()', 'titulo');
      const filterTitulo: SgiRestFilter = {
        field: 'titulo',
        type: SgiRestFilterType.LIKE,
        value: this.buscadorFormGroup.controls.titulo.value,
      };

      this.filter.push(filterTitulo);

    }

    this.logger.debug(PeticionEvaluacionListadoInvComponent.name, 'buildFilters()', 'end');
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
   * Recupera un listado de los comités que hay en el sistema.
   */
  getComites(): void {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
      'getComites()',
      'start');

    this.comitesSubscription = this.comiteService.findAll().subscribe(
      (response) => {
        this.comiteListado = response.items;

        this.filteredComites = this.buscadorFormGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterComite(value))
          );
      });

    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
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
   * Load table data
   */
  public onSearch() {
    this.loadTable(true);
  }

  /**
   * Elimina la peticion de evaluación con el id recibido por parametro.
   * @param peticionEvaluacionId id de la petición de evaluación
   * @param event evento lanzado
   */
  borrar(peticionEvaluacionId: number, $event: Event): void {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
      'borrar(peticionEvaluacionId: number, $event: Event) - start');

    $event.stopPropagation();
    $event.preventDefault();

    this.dialogServiceSubscriptionGetSubscription = this.dialogService.showConfirmation(
      'eti.peticionEvaluacion.listado.eliminar'
    ).subscribe(
      (aceptado: boolean) => {
        if (aceptado) {
          this.peticionEvaluacionServiceDeleteSubscription = this.peticionesEvaluacionService
            .deleteById(peticionEvaluacionId)
            .pipe(
              map(() => {
                return this.loadTable();
              })
            ).subscribe(() => {
              this.snackBarService.showSuccess('peticionEvaluacion.listado.eliminarConfirmado');
            });
        }
        aceptado = false;
      });

    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
      'borrar(peticionEvaluacionId: number, $event: Event) - end');
  }

  /**
   * Clean filters an reload the table
   */
  public onClearFilters() {

    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
      'onClearFilters()',
      'start');
    this.filter = [];
    this.buscadorFormGroup.reset();
    this.loadTable(true);
    this.getComites();
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
      'onClearFilters()',
      'end');
  }


  ngOnDestroy(): void {
    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
      'ngOnDestroy()',
      'start');
    this.comitesSubscription?.unsubscribe();

    this.logger.debug(PeticionEvaluacionListadoInvComponent.name,
      'ngOnDestroy()',
      'end');

  }

}
