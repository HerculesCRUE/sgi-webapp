import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const MSG_LISTADO_ERROR = marker('eti.evaluador.listado.error');

@Component({
  templateUrl: './buscar-persona-dialogo.component.html',
  styleUrls: ['./buscar-persona-dialogo.component.scss']
})
export class BuscarPersonaDialogoComponent implements AfterViewInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];
  elementosPagina: number[];
  totalElementos: number;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  personas$: Observable<IPersona[]> = of();

  constructor(
    private readonly logger: NGXLogger,
    public dialogRef: MatDialogRef<BuscarPersonaDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPersona,
    private personaFisicaService: PersonaFisicaService,
    private snackBarService: SnackBarService) {

    this.displayedColumns = ['nombre', 'primerApellido', 'segundoApellido', 'numIdentificadorPersonal'];
    this.elementosPagina = [5, 10, 25, 100];
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  buscarPersona(reset?: boolean) {
    this.personas$ = this.personaFisicaService
      .findAllPersonas(
        {
          page: {
            index: reset ? 0 : this.paginator.pageIndex,
            size: this.paginator.pageSize
          },
          // TODO: Add sorts
          filter: this.buildFilter(this.data)
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

  private buildFilter(persona: IPersona): SgiRestFilter {
    return new RSQLSgiRestFilter('nombre', SgiRestFilterOperator.EQUALS, persona.nombre)
      .and('primerApellido', SgiRestFilterOperator.EQUALS, persona.primerApellido)
      .and('segundoApellido', SgiRestFilterOperator.EQUALS, persona.segundoApellido)
      .and('identificadorNumero', SgiRestFilterOperator.EQUALS, persona.identificadorNumero)
      .and('identificadorLetra', SgiRestFilterOperator.EQUALS, persona.identificadorLetra);
  }

  ngAfterViewInit(): void {
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
          this.buscarPersona();
        })
      )
      .subscribe();
    // First load
    // this.buscarPersona();
  }

}

