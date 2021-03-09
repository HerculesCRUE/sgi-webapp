import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { from, merge, Observable, of } from 'rxjs';
import { catchError, map, mergeAll, switchMap, tap } from 'rxjs/operators';

const MSG_LISTADO_ERROR = marker('csp.buscadorConvocatoria.listado.error');

interface IConvocatoriaListado {
  convocatoria: IConvocatoria;
  fase: IConvocatoriaFase;
  entidadConvocante: IConvocatoriaEntidadConvocante;
  entidadConvocanteEmpresa: IEmpresaEconomica;
  entidadFinanciadora: IConvocatoriaEntidadFinanciadora;
  entidadFinanciadoraEmpresa: IEmpresaEconomica;
}

@Component({
  templateUrl: './search-convocatoria.component.html',
  styleUrls: ['./search-convocatoria.component.scss']
})
export class SearchConvocatoriaModalComponent implements AfterViewInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['codigo', 'titulo', 'fechaInicioSolicitud', 'fechaFinSolicitud',
    'entidadConvocante', 'planInvestigacion', 'entidadFinanciadora',
    'fuenteFinanciacion'];
  elementosPagina = [5, 10, 25, 100];
  totalElementos = 0;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  convocatorias$: Observable<IConvocatoriaListado[]> = of();

  constructor(
    private readonly logger: NGXLogger,
    public dialogRef: MatDialogRef<SearchConvocatoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConvocatoria,
    private readonly convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private readonly snackBarService: SnackBarService
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
    merge(
      this.paginator.page,
      this.sort.sortChange
    ).pipe(
      tap(() => {
        this.buscarConvocatorias();
      })
    ).subscribe();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  buscarConvocatorias(reset?: boolean) {
    this.convocatorias$ = this.convocatoriaService
      .findAllRestringidos(
        {
          page: {
            index: reset ? 0 : this.paginator.pageIndex,
            size: this.paginator.pageSize
          },
          // TODO: Add sorts
          filter: this.buildFilter(this.dialogRef.componentInstance.data)
        }
      )
      .pipe(
        map(result => {
          const convocatorias = result.items.map((convocatoria) => {
            return {
              convocatoria,
              entidadConvocante: {} as IConvocatoriaEntidadConvocante,
              entidadConvocanteEmpresa: {} as IEmpresaEconomica,
              entidadFinanciadora: {} as IConvocatoriaEntidadFinanciadora,
              entidadFinanciadoraEmpresa: {} as IEmpresaEconomica,
              fase: {} as IConvocatoriaFase
            } as IConvocatoriaListado;
          });
          return {
            page: result.page,
            total: result.total,
            items: convocatorias
          } as SgiRestListResult<IConvocatoriaListado>;
        }),
        switchMap((result) => {
          return from(result.items).pipe(
            map((convocatoriaListado) => {
              return this.convocatoriaService.findEntidadesFinanciadoras(convocatoriaListado.convocatoria.id).pipe(
                map(entidadFinanciadora => {
                  if (entidadFinanciadora.items.length > 0) {
                    convocatoriaListado.entidadFinanciadora = entidadFinanciadora.items[0];
                  }
                  return convocatoriaListado;
                }),
                switchMap(() => {
                  if (convocatoriaListado.entidadFinanciadora.id) {
                    return this.empresaEconomicaService.findById(convocatoriaListado.entidadFinanciadora.empresa.personaRef).pipe(
                      map(empresaEconomica => {
                        convocatoriaListado.entidadFinanciadoraEmpresa = empresaEconomica;
                        return convocatoriaListado;
                      }),
                    );
                  }
                  return of(convocatoriaListado);
                }),
                switchMap(() => {
                  return this.convocatoriaService.findAllConvocatoriaFases(convocatoriaListado.convocatoria.id).pipe(
                    map(convocatoriaFase => {
                      if (convocatoriaFase.items.length > 0) {
                        convocatoriaListado.fase = convocatoriaFase.items[0];
                      }
                      return convocatoriaListado;
                    })
                  );
                }),
                switchMap(() => {
                  return this.convocatoriaService.findAllConvocatoriaEntidadConvocantes(convocatoriaListado.convocatoria.id).pipe(
                    map(convocatoriaEntidadConvocante => {
                      if (convocatoriaEntidadConvocante.items.length > 0) {
                        convocatoriaListado.entidadConvocante = convocatoriaEntidadConvocante.items[0];
                      }
                      return convocatoriaListado;
                    }),
                    switchMap(() => {
                      if (convocatoriaListado.entidadConvocante.id) {
                        return this.empresaEconomicaService.findById(convocatoriaListado.entidadConvocante.entidad.personaRef).pipe(
                          map(empresaEconomica => {
                            convocatoriaListado.entidadConvocanteEmpresa = empresaEconomica;
                            return convocatoriaListado;
                          }),
                        );
                      }
                      return of(convocatoriaListado);
                    }),
                  );
                })
              );
            }),
            mergeAll(),
            map(() => {
              this.totalElementos = result.total;
              return result.items;
            })
          );
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

  private buildFilter(convocatoria: IConvocatoria): SgiRestFilter {
    return new RSQLSgiRestFilter('titulo', SgiRestFilterOperator.LIKE_ICASE, convocatoria.titulo)
      .and('codigo', SgiRestFilterOperator.LIKE_ICASE, convocatoria.codigo)
      .and('anio', SgiRestFilterOperator.EQUALS, convocatoria.anio?.toString())
      .and('abiertoPlazoPresentacionSolicitud', SgiRestFilterOperator.EQUALS, convocatoria.abiertoPlazoPresentacionSolicitud?.toString());
  }


}
