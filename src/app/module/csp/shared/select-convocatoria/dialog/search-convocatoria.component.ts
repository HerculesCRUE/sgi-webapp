import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MSG_PARAMS } from '@core/i18n';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IEmpresa } from '@core/models/sgemp/empresa';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { EmpresaService } from '@core/services/sgemp/empresa.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { LuxonUtils } from '@core/utils/luxon-utils';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { from, merge, Observable, of } from 'rxjs';
import { catchError, map, mergeAll, switchMap, tap } from 'rxjs/operators';

const MSG_LISTADO_ERROR = marker('error.load');

interface IConvocatoriaListado {
  convocatoria: IConvocatoria;
  fase: IConvocatoriaFase;
  entidadConvocante: IConvocatoriaEntidadConvocante;
  entidadConvocanteEmpresa: IEmpresa;
  entidadFinanciadora: IConvocatoriaEntidadFinanciadora;
  entidadFinanciadoraEmpresa: IEmpresa;
}

@Component({
  templateUrl: './search-convocatoria.component.html',
  styleUrls: ['./search-convocatoria.component.scss']
})
export class SearchConvocatoriaModalComponent implements AfterViewInit {

  formGroup: FormGroup;

  displayedColumns = ['codigo', 'titulo', 'fechaInicioSolicitud', 'fechaFinSolicitud',
    'entidadConvocante', 'planInvestigacion', 'entidadFinanciadora',
    'fuenteFinanciacion'];
  elementosPagina = [5, 10, 25, 100];
  totalElementos = 0;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  convocatorias$: Observable<IConvocatoriaListado[]> = of();

  get MSG_PARAMS() {
    return MSG_PARAMS;
  }

  constructor(
    private readonly logger: NGXLogger,
    public dialogRef: MatDialogRef<SearchConvocatoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConvocatoria,
    private readonly convocatoriaService: ConvocatoriaService,
    private empresaService: EmpresaService,
    private readonly snackBarService: SnackBarService
  ) {
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      codigo: new FormControl(''),
      titulo: new FormControl(''),
      fechaPublicacionDesde: new FormControl(null),
      fechaPublicacionHasta: new FormControl(null),
      abiertoPlazoPresentacionSolicitud: new FormControl(''),
    });
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

  buscarConvocatorias(reset?: boolean) {

    this.convocatorias$ = this.convocatoriaService
      .findAllRestringidos(

        {
          page: {
            index: reset ? 0 : this.paginator.pageIndex,
            size: this.paginator.pageSize
          },
          // TODO: Add sorts
          filter: this.buildFilter()
        }
      )
      .pipe(
        map(result => {
          const convocatorias = result.items.map((convocatoria) => {
            return {
              convocatoria,
              entidadConvocante: {} as IConvocatoriaEntidadConvocante,
              entidadConvocanteEmpresa: {} as IEmpresa,
              entidadFinanciadora: {} as IConvocatoriaEntidadFinanciadora,
              entidadFinanciadoraEmpresa: {} as IEmpresa,
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
                    return this.empresaService.findById(convocatoriaListado.entidadFinanciadora.empresa.id).pipe(
                      map(empresa => {
                        convocatoriaListado.entidadFinanciadoraEmpresa = empresa;
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
                        return this.empresaService.findById(convocatoriaListado.entidadConvocante.entidad.id).pipe(
                          map(empresa => {
                            convocatoriaListado.entidadConvocanteEmpresa = empresa;
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

  private buildFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    return new RSQLSgiRestFilter('titulo', SgiRestFilterOperator.LIKE_ICASE, controls.titulo.value)
      .and('codigo', SgiRestFilterOperator.LIKE_ICASE, controls.codigo.value)
      .and('fechaPublicacion', SgiRestFilterOperator.GREATHER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaPublicacionDesde.value))
      .and('fechaPublicacion', SgiRestFilterOperator.LOWER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaPublicacionHasta.value))
      .and('abiertoPlazoPresentacionSolicitud', SgiRestFilterOperator.EQUALS, controls.abiertoPlazoPresentacionSolicitud.value?.toString());
  }

}
