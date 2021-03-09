import { FormControl, FormGroup } from '@angular/forms';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { ISolicitudProyectoPresupuesto } from '@core/models/csp/solicitud-proyecto-presupuesto';
import { Fragment } from '@core/services/action-service';
import { SolicitudProyectoPresupuestoService } from '@core/services/csp/solicitud-proyecto-presupuesto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { catchError, map, mergeAll, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export class SolicitudProyectoPresupuestoGlobalFragment extends Fragment {
  formGroup: FormGroup;
  partidasGastos$ = new BehaviorSubject<StatusWrapper<ISolicitudProyectoPresupuesto>[]>([]);
  private partidasGastosEliminadas: StatusWrapper<ISolicitudProyectoPresupuesto>[] = [];

  existsDatosProyecto = false;

  constructor(
    key: number,
    private solicitudService: SolicitudService,
    private solicitudProyectoPresupuestoService: SolicitudProyectoPresupuestoService,
    private empresaEconomicaService: EmpresaEconomicaService,
    public readonly: boolean
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    this.formGroup = new FormGroup({
      totalPresupuesto: new FormControl({ value: '', disabled: true })
    });

    const solicitudId = this.getKey() as number;
    if (solicitudId) {
      const subscription = this.solicitudService.findAllSolicitudProyectoPresupuesto(solicitudId).pipe(
        switchMap((solicitudProyectoPresupuestos) =>
          from(solicitudProyectoPresupuestos)
            .pipe(
              map((solicitudProyectoPresupuesto) => {
                if (solicitudProyectoPresupuesto.empresa.personaRef) {
                  return this.empresaEconomicaService.findById(solicitudProyectoPresupuesto.empresa.personaRef)
                    .pipe(
                      tap(empresaEconomica => solicitudProyectoPresupuesto.empresa = empresaEconomica),
                      catchError(() => of(null))
                    );
                } else {
                  return of(solicitudProyectoPresupuesto);
                }
              }),
              mergeAll(),
              map(() => {
                return solicitudProyectoPresupuestos
                  .map(element => new StatusWrapper<ISolicitudProyectoPresupuesto>(element));
              })
            )
        ),
        takeLast(1)
      ).subscribe(
        (solicitudProyectoPresupuestos) => {
          this.partidasGastos$.next(solicitudProyectoPresupuestos);
          this.updateTotalPresupuesto();
        }
      );
      this.subscriptions.push(subscription);
    }
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteSolicitudProyectoPresupuestos(),
      this.updateSolicitudProyectoPresupuestos(),
      this.createSolicitudProyectoPresupuestos()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      })
    );
  }

  /**
   * Elimina la partida de gasto y la marca como eliminada si ya existia previamente.
   *
   * @param wrapper ISolicitudProyectoPresupuesto
   */
  public deletePartidaGasto(wrapper: StatusWrapper<ISolicitudProyectoPresupuesto>): void {
    const current = this.partidasGastos$.value;
    const index = current.findIndex((value) => value === wrapper);
    if (index >= 0) {
      if (!wrapper.created) {
        this.partidasGastosEliminadas.push(current[index]);
      }
      current.splice(index, 1);
      this.partidasGastos$.next(current);
      this.setChanges(true);
      this.updateTotalPresupuesto();
    }
  }

  public addPartidaGasto(partidaGasto: ISolicitudProyectoPresupuesto) {
    const wrapped = new StatusWrapper<ISolicitudProyectoPresupuesto>(partidaGasto);
    wrapped.setCreated();
    const current = this.partidasGastos$.value;
    current.push(wrapped);
    this.partidasGastos$.next(current);
    this.setChanges(true);
    this.updateTotalPresupuesto();
  }

  public updatePartidaGasto(wrapper: StatusWrapper<ISolicitudProyectoPresupuesto>) {
    const current = this.partidasGastos$.value;
    const index = current.findIndex(value => value.value.id === wrapper.value.id);
    if (index >= 0) {
      wrapper.setEdited();
      this.partidasGastos$.value[index] = wrapper;
      this.setChanges(true);
      this.updateTotalPresupuesto();
    }
  }

  /**
   * Elimina las partidas de gasto añadidas a partidasGastosEliminadas.
   */
  private deleteSolicitudProyectoPresupuestos(): Observable<void> {
    if (this.partidasGastosEliminadas.length === 0) {
      return of(void 0);
    }

    return from(this.partidasGastosEliminadas).pipe(
      mergeMap((wrapped) => {
        return this.solicitudProyectoPresupuestoService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.partidasGastosEliminadas = this.partidasGastosEliminadas
                .filter(deletedEnlace => deletedEnlace.value.id !== wrapped.value.id);
            })
          );
      })
    );
  }

  /**
   * Actualiza las SolicitudProyectoPresupuesto modificadas.
   */
  private updateSolicitudProyectoPresupuestos(): Observable<void> {
    const updatedSolicitudProyectoPresupuestos = this.partidasGastos$.value.filter((wrapper) => wrapper.edited);
    if (updatedSolicitudProyectoPresupuestos.length === 0) {
      return of(void 0);
    }

    return from(updatedSolicitudProyectoPresupuestos).pipe(
      mergeMap((wrapped) => {
        const solicitudProyectoPresupuesto = wrapped.value;
        return this.solicitudProyectoPresupuestoService.update(solicitudProyectoPresupuesto.id, solicitudProyectoPresupuesto).pipe(
          map((updated) => {
            const index = this.partidasGastos$.value.findIndex((current) => current === wrapped);
            this.partidasGastos$.value[index] = new StatusWrapper<ISolicitudProyectoPresupuesto>(updated);
          })
        );
      })
    );
  }

  private createSolicitudProyectoPresupuestos(): Observable<void> {
    const createdSolicitudProyectoPresupuestos = this.partidasGastos$.value.filter((solicitudProyectoPresupuesto) =>
      solicitudProyectoPresupuesto.created);
    if (createdSolicitudProyectoPresupuestos.length === 0) {
      return of(void 0);
    }
    const id = this.getKey() as number;

    return this.solicitudService.findSolicitudProyectoDatos(id).pipe(
      switchMap(solicitudProyectoDatos => {
        return from(createdSolicitudProyectoPresupuestos).pipe(
          mergeMap((wrapped) => {
            const solicitudProyectoPresupuesto = wrapped.value;
            solicitudProyectoPresupuesto.solicitudProyectoDatos = { id: solicitudProyectoDatos.id } as ISolicitudProyectoDatos;
            return this.solicitudProyectoPresupuestoService.create(solicitudProyectoPresupuesto).pipe(
              map((updated) => {
                const index = this.partidasGastos$.value.findIndex((current) => current === wrapped);
                this.partidasGastos$.value[index] = new StatusWrapper<ISolicitudProyectoPresupuesto>(updated);
              })
            );
          }),
          takeLast(1)
        );
      })
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.partidasGastos$.value.some((wrapper) => wrapper.touched);
    return (this.partidasGastosEliminadas.length > 0 || touched);
  }

  private updateTotalPresupuesto() {
    const totalPresupuesto = this.partidasGastos$.value.reduce((total, partidaGasto) => total + partidaGasto.value.importeSolicitado, 0);
    this.formGroup.controls.totalPresupuesto.setValue(totalPresupuesto);
  }

}
