import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MSG_PARAMS } from '@core/i18n';
import { IPersona } from '@core/models/sgp/persona';
import { PersonaService } from '@core/services/sgp/persona.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, RSQLSgiRestSort, SgiRestFilter, SgiRestFilterOperator, SgiRestSortDirection } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const MSG_LISTADO_ERROR = marker('error.load');

export interface SearchPersonaModalData {
  tipoColectivo: string;
  colectivos: string[];
}

@Component({
  templateUrl: './search-persona.component.html',
  styleUrls: ['./search-persona.component.scss']
})
export class SearchPersonaModalComponent implements OnInit, AfterViewInit {

  formGroup: FormGroup;

  displayedColumns = ['nombre', 'apellidos', 'numeroDocumento', 'acciones'];
  elementosPagina = [5, 10, 25, 100];
  totalElementos = 0;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  personas$: Observable<IPersona[]> = of();

  constructor(
    private readonly logger: NGXLogger,
    public dialogRef: MatDialogRef<SearchPersonaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SearchPersonaModalData,
    private personaService: PersonaService,
    private snackBarService: SnackBarService
  ) {
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      datosPersona: new FormControl()
    });
  }

  ngAfterViewInit(): void {
    this.search(true);

    merge(
      this.paginator.page,
      this.sort.sortChange
    ).pipe(
      tap(() => this.search())
    ).subscribe();
  }

  closeModal(persona?: IPersona): void {
    this.dialogRef.close(persona);
  }

  search(reset?: boolean) {
    this.personas$ = this.personaService
      .findAll(
        {
          page: {
            index: reset ? 0 : this.paginator.pageIndex,
            size: this.paginator.pageSize
          },
          sort: new RSQLSgiRestSort(this.sort?.active, SgiRestSortDirection.fromSortDirection(this.sort?.direction)),
          filter: this.buildFilter(this.dialogRef.componentInstance.data)
        }
      )
      .pipe(
        map((response) => {
          // Map response total
          this.totalElementos = response.total;
          // Reset pagination to first page
          if (reset) {
            this.paginator.pageIndex = 0;
          }
          // Return the values
          return response.items;
        }),
        catchError((error) => {
          this.logger.error(error);
          // On error reset pagination values
          this.paginator.firstPage();
          this.totalElementos = 0;
          this.snackBarService.showError(MSG_LISTADO_ERROR);
          return of([]);
        })
      );
  }

  /**
   * Clean filters an reload the table
   */
  onClearFilters(): void {
    this.formGroup.reset();
    this.search(true);
  }

  get MSG_PARAMS() {
    return MSG_PARAMS;
  }

  /**
   * Recupera el filtro resultante de componer los filtros recibidos y los filtros del formulario
   *
   * @param filter filtros que se quieren aplicar
   * @returns el filtro
   */
  private buildFilter(filter: SearchPersonaModalData): SgiRestFilter {
    const controls = this.formGroup.controls;

    const rsqlFilter = new RSQLSgiRestFilter('nombre', SgiRestFilterOperator.LIKE_ICASE, controls.datosPersona.value)
      .or('apellidos', SgiRestFilterOperator.LIKE_ICASE, controls.datosPersona.value)
      .or('numeroDocumento', SgiRestFilterOperator.LIKE_ICASE, controls.datosPersona.value);

    if (filter?.colectivos?.length) {
      rsqlFilter.and('colectivoId', SgiRestFilterOperator.IN, filter.colectivos);
    } else if (filter?.tipoColectivo) {
      rsqlFilter.and('tipoColectivo', SgiRestFilterOperator.EQUALS, filter.tipoColectivo);
    }

    return rsqlFilter;
  }

}
