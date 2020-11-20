import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NGXLogger } from 'ngx-logger';
import { IPersonaDialogo } from '@core/models/eti/persona-dialogo';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SgiRestFilter, SgiRestFilterType, SgiRestSortDirection } from '@sgi/framework/http';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, of, merge } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SnackBarService } from '@core/services/snack-bar.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

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
  filter: SgiRestFilter[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  personas$: Observable<IPersona[]> = of();

  usuarioDialogo: IPersonaDialogo;
  persona: IPersona;

  constructor(
    public dialogRef: MatDialogRef<BuscarPersonaDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPersona,
    private readonly personaFisicaService: PersonaFisicaService,
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService) {

    this.displayedColumns = ['nombre', 'primerApellido', 'segundoApellido', 'numIdentificadorPersonal'];
    this.elementosPagina = [5, 10, 25, 100];
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

    this.persona = {
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      identificadorLetra: '',
      identificadorNumero: '',
      personaRef: '',
      nivelAcademico: '',
      vinculacion: ''
    };

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
          sort: {
            direction: SgiRestSortDirection.fromSortDirection(this.sort.direction),
            field: 'personaRef'
          },
          filters: this.buildFilters(this.dialogRef.componentInstance.data)
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
          this.logger.debug(BuscarPersonaDialogoComponent.name, 'loadTable()', 'end');
          // Return the values
          return response.items;
        }),
        catchError(() => {
          // On error reset pagination values
          this.paginator.firstPage();
          this.totalElementos = 0;
          this.snackBarService.showError(MSG_LISTADO_ERROR);
          this.logger.debug(BuscarPersonaDialogoComponent.name, 'loadTable()', 'end');
          return of([]);
        })
      );

  }

  private buildFilters(persona: IPersona): SgiRestFilter[] {
    this.logger.debug(BuscarPersonaDialogoComponent.name, 'buildFilters()', 'start');

    this.filter = [];
    if (persona.nombre) {
      this.logger.debug(BuscarPersonaDialogoComponent.name, 'buildFilters()', 'comite');
      const filterNombre: SgiRestFilter = {
        field: 'nombre',
        type: SgiRestFilterType.EQUALS,
        value: persona.nombre,
      };

      this.filter.push(filterNombre);
    }

    if (persona.primerApellido) {
      this.logger.debug(BuscarPersonaDialogoComponent.name, 'buildFilters()', 'comite');
      const filterPrimerApellido: SgiRestFilter = {
        field: 'primerApellido',
        type: SgiRestFilterType.EQUALS,
        value: persona.primerApellido,
      };

      this.filter.push(filterPrimerApellido);
    }

    if (persona.segundoApellido) {
      this.logger.debug(BuscarPersonaDialogoComponent.name, 'buildFilters()', 'comite');
      const filterSegundoApellido: SgiRestFilter = {
        field: 'segundoApellido',
        type: SgiRestFilterType.EQUALS,
        value: persona.segundoApellido,
      };

      this.filter.push(filterSegundoApellido);
    }

    if (persona.identificadorNumero) {
      this.logger.debug(BuscarPersonaDialogoComponent.name, 'buildFilters()', 'comite');
      const filterNumIdentificadorPersonal: SgiRestFilter = {
        field: 'identificadorNumero',
        type: SgiRestFilterType.EQUALS,
        value: persona.identificadorNumero,
      };

      this.filter.push(filterNumIdentificadorPersonal);
    }

    if (persona.identificadorLetra) {
      this.logger.debug(BuscarPersonaDialogoComponent.name, 'buildFilters()', 'comite');
      const filterLetraIdentificadorPersonal: SgiRestFilter = {
        field: 'identificadorLetra',
        type: SgiRestFilterType.EQUALS,
        value: persona.identificadorLetra,
      };

      this.filter.push(filterLetraIdentificadorPersonal);
    }

    this.logger.debug(BuscarPersonaDialogoComponent.name, 'buildFilters()', 'end');
    return this.filter;
  }

  ngAfterViewInit(): void {
    this.logger.debug(BuscarPersonaDialogoComponent.name, 'ngAfterViewInit()', 'start');

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

    this.logger.debug(BuscarPersonaDialogoComponent.name, 'ngAfterViewInit()', 'end');
  }

}

