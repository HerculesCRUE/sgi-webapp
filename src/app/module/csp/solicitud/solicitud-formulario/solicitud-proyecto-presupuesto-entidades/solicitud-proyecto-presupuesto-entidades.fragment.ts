import { FormControl, FormGroup } from '@angular/forms';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { ISolicitudProyectoPresupuestoTotales } from '@core/models/csp/solicitud-proyecto-presupuesto-totales';
import { FormFragment } from '@core/services/action-service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { EmpresaService } from '@core/services/sgemp/empresa.service';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeAll, switchMap, takeLast } from 'rxjs/operators';

export interface EntidadFinanciadoraDesglosePresupuesto {
  entidadFinanciadora: IEntidadFinanciadora;
  ajena: boolean;
}

export class SolicitudProyectoPresupuestoEntidadesFragment extends FormFragment<ISolicitudProyectoPresupuestoTotales> {

  entidadesFinanciadoras$ = new BehaviorSubject<EntidadFinanciadoraDesglosePresupuesto[]>([]);

  constructor(
    key: number,
    public convocatoriaId: number,
    private convocatoriaService: ConvocatoriaService,
    private solicitudService: SolicitudService,
    private empresaService: EmpresaService,
    public readonly: boolean
  ) {
    super(key, true);
    this.setComplete(true);
  }

  protected initializer(key: number): Observable<ISolicitudProyectoPresupuestoTotales> {
    const subscription =
      merge(
        this.loadEntidadFinanciadoraConvocatoria(this.convocatoriaId),
        this.loadEntidadFinanciadoraSolicitud(key)
      ).subscribe(
        (result) => {
          this.entidadesFinanciadoras$.next(this.entidadesFinanciadoras$.value.concat(result));
        }
      );

    this.subscriptions.push(subscription);

    return this.solicitudService.getSolicitudProyectoPresupuestoTotales(key);
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup({
      totalPresupuesto: new FormControl({ value: '', disabled: true }),
      totalPresupuestoConvocatoria: new FormControl({ value: '', disabled: true }),
      totalPresupuestoAjeno: new FormControl({ value: '', disabled: true })
    });

    return form;
  }

  protected buildPatch(solicitudProyectoPresupuestoTotales: ISolicitudProyectoPresupuestoTotales): { [key: string]: any; } {
    const result = {
      totalPresupuesto: solicitudProyectoPresupuestoTotales.importeTotal,
      totalPresupuestoConvocatoria: solicitudProyectoPresupuestoTotales.importeTotalConvocatoria,
      totalPresupuestoAjeno: solicitudProyectoPresupuestoTotales.importeTotalAjeno
    };

    return result;
  }

  getValue(): ISolicitudProyectoPresupuestoTotales {
    return null;
  }

  saveOrUpdate(): Observable<void> {
    return of(void 0);
  }

  private loadEntidadFinanciadoraSolicitud(solicitudId: number): Observable<EntidadFinanciadoraDesglosePresupuesto[]> {
    return this.solicitudService.findAllSolicitudProyectoEntidadFinanciadora(solicitudId)
      .pipe(
        map(result => {
          return result.items;
        }),
        switchMap((entidadesFinanciadoras) => {
          if (entidadesFinanciadoras.length === 0) {
            return of([] as EntidadFinanciadoraDesglosePresupuesto[]);
          }

          return from(entidadesFinanciadoras)
            .pipe(
              map((entidadesFinanciadora) => {
                return this.empresaService.findById(entidadesFinanciadora.empresa.id)
                  .pipe(
                    map(empresa => {
                      entidadesFinanciadora.empresa = empresa;
                      return entidadesFinanciadora;
                    }),
                  );

              }),
              mergeAll(),
              map(() => {
                return entidadesFinanciadoras.map((entidadFinanciadora) => {
                  const entidadFinanciadoraDesglosePresupuesto: EntidadFinanciadoraDesglosePresupuesto = {
                    entidadFinanciadora,
                    ajena: true
                  };

                  return entidadFinanciadoraDesglosePresupuesto;
                });
              })
            );
        }),
        takeLast(1)
      );
  }

  private loadEntidadFinanciadoraConvocatoria(convocatoriaId: number): Observable<EntidadFinanciadoraDesglosePresupuesto[]> {
    if (!convocatoriaId) {
      return of([] as EntidadFinanciadoraDesglosePresupuesto[]);
    }

    return this.convocatoriaService.findEntidadesFinanciadoras(convocatoriaId)
      .pipe(
        map(result => result.items),
        switchMap((entidadesFinanciadoras) => {
          if (entidadesFinanciadoras.length === 0) {
            return of([] as EntidadFinanciadoraDesglosePresupuesto[]);
          }

          return from(entidadesFinanciadoras)
            .pipe(
              map((entidadesFinanciadora) => {
                return this.empresaService.findById(entidadesFinanciadora.empresa.id)
                  .pipe(
                    map(empresa => {
                      entidadesFinanciadora.empresa = empresa;
                      return entidadesFinanciadora;
                    }),
                  );
              }),
              mergeAll(),
              map(() => {
                return entidadesFinanciadoras.map((entidadFinanciadora) => {
                  const entidadFinanciadoraDesglosePresupuesto: EntidadFinanciadoraDesglosePresupuesto = {
                    entidadFinanciadora,
                    ajena: false
                  };

                  return entidadFinanciadoraDesglosePresupuesto;
                });
              })
            );
        }),
        takeLast(1)
      );
  }

}
