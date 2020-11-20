import { AfterViewInit, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import {
  SgiRestFilter,
  SgiRestFilterType,
  SgiRestFindOptions,
  SgiRestListResult,
  SgiRestSortDirection,
} from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export abstract class AbstractTableWithoutPaginationComponent<T> implements OnInit, OnDestroy, AfterViewInit {
  columnas: string[];
  elementosPagina: number[];
  totalElementos: number;
  filter: SgiRestFilter[];
  suscripciones: Subscription[];
  formGroup: FormGroup;

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  protected constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    protected readonly msgError: string
  ) {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'constructor()', 'start');
    this.elementosPagina = [5, 10, 25, 100];
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'ngOnInit()', 'start');
    this.totalElementos = 0;
    this.suscripciones = [];
    this.filter = [];
    this.initColumns();
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones.forEach(x => x.unsubscribe());
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'ngOnDestroy()', 'end');
  }

  ngAfterViewInit(): void {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'ngAfterViewInit()', 'start');
    // Merge events that trigger load table data
    merge(
      // Link sortChange event to fire new request
      this.sort?.sortChange
    ).pipe(
      tap(() => {
        // Load table
        this.loadTable();
      }),
      catchError(err => {
        return err;
      })
    ).subscribe();
    // First load
    this.loadTable();
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, 'ngAfterViewInit()', 'end');
  }

  /**
   * Load table data
   */
  onSearch(): void {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.onSearch.name}()`, 'start');
    this.filter = this.createFilters();
    this.loadTable(true);
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.onSearch.name}()`, 'end');
  }

  /**
   * Clean filters an reload the table
   */
  onClearFilters(): void {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.onClearFilters.name}()`, 'start');
    FormGroupUtil.clean(this.formGroup);
    this.filter = [{
      field: undefined,
      type: SgiRestFilterType.NONE,
      value: '',
    }];
    this.loadTable(true);
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  /**
   * Devuelve el observable con la petición del listado paginado
   *
   * @param reset Inidica si reinicializa la paginación
   */
  protected getObservableLoadTable(reset?: boolean): Observable<T[]> {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name,
      `${this.getObservableLoadTable.name}(${reset})`, 'start');
    // Do the request with paginator/sort/filter values
    const observable$ = this.createObservable();
    return observable$?.pipe(
      map((response: SgiRestListResult<T>) => {
        // Map respose total
        this.totalElementos = response.total;
        // Reset pagination to first page
        this.logger.debug(AbstractTableWithoutPaginationComponent.name,
          `${this.getObservableLoadTable.name}(${reset})`, 'end');
        // Return the values
        return response.items;
      }),
      catchError(() => {
        // On error reset pagination values
        this.totalElementos = 0;
        this.showMensajeErrorLoadTable();
        this.logger.error(AbstractTableWithoutPaginationComponent.name,
          `${this.getObservableLoadTable.name}(${reset})`, 'error');
        return of([]);
      })
    );
  }

  /**
   * Crea las opciones para el listado que devuelve el servidor.
   * Hay que añadirlo al método del servicio que llamamos
   *
   * @param reset Indica la pagina actual es la primera o no
   */
  protected getFindOptions(reset?: boolean): SgiRestFindOptions {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.getFindOptions.name}(${reset})`, 'start');
    const options = {
      sort: {
        direction: SgiRestSortDirection.fromSortDirection(this.sort.direction),
        field: this.sort.active,
      },
      filters: this.filter,
    };
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.getFindOptions.name}(${reset})`, 'end');
    return options;
  }

  protected addFiltro(filtros: SgiRestFilter[], nombre: string, tipo: SgiRestFilterType, valor: any): void {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name,
      `${this.addFiltro.name}([${filtros}], ${nombre}, ${tipo} , ${valor})`, 'start');
    if (valor) {
      const filtro: SgiRestFilter = {
        field: nombre,
        type: tipo,
        value: valor,
      };
      filtros.push(filtro);
    }
    this.logger.debug(AbstractTableWithoutPaginationComponent.name,
      `${this.addFiltro.name}([${filtros}], ${nombre}, ${tipo} , ${valor})`, 'end');
  }

  /**
   * Muestra un mensaje de error si se produce un error al cargar los datos de la tabla
   */
  protected showMensajeErrorLoadTable(): void {
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.showMensajeErrorLoadTable.name}()`, 'start');
    this.snackBarService.showError(this.msgError);
    this.logger.debug(AbstractTableWithoutPaginationComponent.name, `${this.showMensajeErrorLoadTable.name}()`, 'end');
  }

  /**
   * Crea la petición al servidor para cargar los datos de la tabla
   */
  protected abstract createObservable(): Observable<SgiRestListResult<T>>;

  /**
   * Crea e indica el orden las columnas de la tabla
   */
  protected abstract initColumns(): void;

  /**
   * Carga los datos de la tabla
   *
   * @param reset Indica si reinicializa la paginación
   */
  protected abstract loadTable(reset?: boolean): void;

  /**
   * Crea los filtros para el listado
   */
  protected abstract createFilters(formGroup?: FormGroup): SgiRestFilter[];
}