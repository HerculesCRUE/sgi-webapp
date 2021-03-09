import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


const MSG_LISTADO_ERROR = marker('sgp.buscadorEmpresaEconomica.listado.error');

export interface SearchEmpresaEconomicaModalData {
  filter?: IEmpresaEconomica[];
}

@Component({
  templateUrl: './search-empresa-economica.component.html',
  styleUrls: ['./search-empresa-economica.component.scss']
})
export class SearchEmpresaEconomicaModalComponent implements OnInit, AfterViewInit {

  formGroup: FormGroup;
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['tipo', 'tipoDocumento', 'numeroDocumento', 'razonSocial', 'direccion', 'tipoEmpresa', 'acciones'];
  elementosPagina = [5, 10, 25, 100];
  totalElementos = 0;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  empresasEconomicas$: Observable<IEmpresaEconomica[]> = of();

  constructor(
    private readonly logger: NGXLogger,
    public dialogRef: MatDialogRef<SearchEmpresaEconomicaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SearchEmpresaEconomicaModalData,
    private empresaEconomicaService: EmpresaEconomicaService,
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

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      numeroDocumento: new FormControl(),
      razonSocial: new FormControl()
    });
  }

  ngAfterViewInit(): void {
    merge(
      this.paginator.page,
      this.sort.sortChange
    ).pipe(
      tap(() => this.buscarEmpresasEconomicas())
    ).subscribe();
  }

  closeModal(empresaEconomica?: IEmpresaEconomica): void {
    this.dialogRef.close(empresaEconomica);
  }

  buscarEmpresasEconomicas(reset?: boolean): void {
    const options: SgiRestFindOptions = {
      page: {
        index: reset ? 0 : this.paginator.pageIndex,
        size: this.paginator.pageSize
      },
      // TODO: Add sorts
      filter: this.getFilter()
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

  private getFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    return new RSQLSgiRestFilter('numeroDocumento', SgiRestFilterOperator.LIKE_ICASE, controls.numeroDocumento.value)
      .and('razonSocial', SgiRestFilterOperator.LIKE_ICASE, controls.razonSocial.value);
  }

  checkSelectedEmpresa(empresa: IEmpresaEconomica) {
    if (!this.data.filter) {
      return true;
    }
    const index = this.data.filter.findIndex(x => x.personaRef === empresa.personaRef);
    const result = index < 0;
    return result;
  }
}
