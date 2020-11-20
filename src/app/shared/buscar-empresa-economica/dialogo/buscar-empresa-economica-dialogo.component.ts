import { Component, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SgiRestFilter, SgiRestFilterType, SgiRestFindOptions, SgiRestSortDirection } from '@sgi/framework/http';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, of, merge } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { tap, map, catchError } from 'rxjs/operators';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';

const MSG_LISTADO_ERROR = marker('sgp.buscadorEmpresaEconomica.listado.error');

export interface EmpresaEconomicaModalData {
  empresaEconomica: IEmpresaEconomica;
  selectedEmpresa?: IEmpresaEconomica[];
}

@Component({
  templateUrl: './buscar-empresa-economica-dialogo.component.html',
  styleUrls: ['./buscar-empresa-economica-dialogo.component.scss']
})
export class BuscarEmpresaEconomicaDialogoComponent implements AfterViewInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['tipo', 'tipoDocumento', 'numeroDocumento', 'razonSocial', 'direccion', 'tipoEmpresa', 'acciones'];
  elementosPagina = [5, 10, 25, 100];
  totalElementos = 0;
  private filter: SgiRestFilter[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  empresasEconomicas$: Observable<IEmpresaEconomica[]> = of();

  constructor(
    public dialogRef: MatDialogRef<BuscarEmpresaEconomicaDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmpresaEconomicaModalData,
    private empresaEconomicaService: EmpresaEconomicaService,
    private logger: NGXLogger,
    private snackBarService: SnackBarService
  ) {
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

  ngAfterViewInit(): void {
    this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name, 'ngAfterViewInit()', 'start');
    merge(
      this.paginator.page,
      this.sort.sortChange
    ).pipe(
      tap(() => this.buscarEmpresasEconomicas())
    ).subscribe();
    this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name, 'ngAfterViewInit()', 'end');
  }

  closeModal(empresaEconomica?: IEmpresaEconomica): void {
    this.dialogRef.close(empresaEconomica);
  }

  buscarEmpresasEconomicas(reset?: boolean): void {
    this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name,
      `buscarEmpresasEconomicas()`, 'start');
    const options: SgiRestFindOptions = {
      page: {
        index: reset ? 0 : this.paginator.pageIndex,
        size: this.paginator.pageSize
      },
      sort: {
        direction: SgiRestSortDirection.fromSortDirection(this.sort.direction),
        field: this.sort.active
      },
      filters: this.buildFilters(this.dialogRef.componentInstance.data.empresaEconomica)
    };
    this.empresasEconomicas$ = this.empresaEconomicaService.findAll(options)
      .pipe(
        map((response) => {
          // Map response total
          this.totalElementos = response.total;
          // Reset pagination to first page
          if (reset) {
            this.paginator.pageIndex = 0;
          }
          this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name,
            `buscarEmpresasEconomicas()`, 'end');
          // Return the values
          return response.items;
        }),
        catchError((error) => {
          // On error reset pagination values
          this.paginator.firstPage();
          this.totalElementos = 0;
          this.snackBarService.showError(MSG_LISTADO_ERROR);
          this.logger.error(BuscarEmpresaEconomicaDialogoComponent.name,
            `buscarEmpresasEconomicas()`, error);
          return of([]);
        })
      );
  }

  private buildFilters(empresaEconomica: IEmpresaEconomica): SgiRestFilter[] {
    this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name, `buildFilters()`, 'start');
    this.filter = [];
    if (empresaEconomica.numeroDocumento) {
      const filterNombre: SgiRestFilter = {
        field: 'numeroDocumento',
        type: SgiRestFilterType.LIKE,
        value: empresaEconomica.numeroDocumento,
      };
      this.filter.push(filterNombre);
    }
    if (empresaEconomica.razonSocial) {
      const filterPrimerApellido: SgiRestFilter = {
        field: 'razonSocial',
        type: SgiRestFilterType.LIKE,
        value: empresaEconomica.razonSocial,
      };
      this.filter.push(filterPrimerApellido);
    }
    this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name, `buildFilters()`, 'end');
    return this.filter;
  }

  checkSelectedEmpresa(empresa: IEmpresaEconomica) {
    this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name,
      `checkSelectedEmpresa()`, 'start');
    if (!this.data.selectedEmpresa) {
      return true;
    }
    const index = this.data.selectedEmpresa.findIndex(x => x.personaRef === empresa.personaRef);
    const result = index < 0;
    this.logger.debug(BuscarEmpresaEconomicaDialogoComponent.name,
      `checkSelectedEmpresa()`, 'end');
    return result;
  }
}
