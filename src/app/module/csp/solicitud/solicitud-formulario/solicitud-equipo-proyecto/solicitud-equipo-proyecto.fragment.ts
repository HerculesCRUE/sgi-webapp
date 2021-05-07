import { ISolicitudProyectoEquipo } from '@core/models/csp/solicitud-proyecto-equipo';
import { Fragment } from '@core/services/action-service';
import { SolicitudProyectoEquipoService } from '@core/services/csp/solicitud-proyecto-equipo.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';

export class SolicitudEquipoProyectoFragment extends Fragment {
  proyectoEquipos$ = new BehaviorSubject<StatusWrapper<ISolicitudProyectoEquipo>[]>([]);
  private proyectosEquipoEliminados: StatusWrapper<ISolicitudProyectoEquipo>[] = [];

  constructor(
    key: number,
    private solicitudService: SolicitudService,
    private solicitudProyectoEquipoService: SolicitudProyectoEquipoService,
    public readonly: boolean
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    const id = this.getKey() as number;
    if (id) {
      const subscription = this.solicitudService.findAllSolicitudProyectoEquipo(id).pipe(
        map(result => result.items.map(solicitudProyectoEquipo =>
          new StatusWrapper<ISolicitudProyectoEquipo>(solicitudProyectoEquipo)
        )),
      ).subscribe(
        (result) => {
          this.proyectoEquipos$.next(result);
        }
      );
      this.subscriptions.push(subscription);
    }
  }

  public deleteProyectoEquipo(wrapper: StatusWrapper<ISolicitudProyectoEquipo>): void {
    const current = this.proyectoEquipos$.value;
    const index = current.findIndex(
      (value) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.proyectosEquipoEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.proyectoEquipos$.next(current);
      this.setChanges(true);
    }
  }

  addProyectoEquipo(equipoProyectoData: ISolicitudProyectoEquipo): void {
    const wrapped = new StatusWrapper<ISolicitudProyectoEquipo>(equipoProyectoData);
    wrapped.setCreated();
    const current = this.proyectoEquipos$.value;
    current.push(wrapped);
    this.proyectoEquipos$.next(current);
    this.setChanges(true);
  }

  updateProyectoEquipo(wrapper: StatusWrapper<ISolicitudProyectoEquipo>): void {
    const current = this.proyectoEquipos$.value;
    const index = current.findIndex(value => value.value.id === wrapper.value.id);
    if (index >= 0) {
      if (!wrapper.created) {
        wrapper.setEdited();
        this.setChanges(true);
      }
      this.proyectoEquipos$.value[index] = wrapper;
      this.proyectoEquipos$.next(this.proyectoEquipos$.value);
    }
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteEquipoProyecto(),
      this.updateEquipoProyecto(),
      this.createEquipoProyecto()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      })
    );
  }

  private deleteEquipoProyecto(): Observable<void> {
    if (this.proyectosEquipoEliminados.length === 0) {
      return of(void 0);
    }
    return from(this.proyectosEquipoEliminados).pipe(
      mergeMap((wrapped) => {
        return this.solicitudProyectoEquipoService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.proyectosEquipoEliminados = this.proyectosEquipoEliminados.filter(deletedHito =>
                deletedHito.value.id !== wrapped.value.id);
            })
          );
      })
    );
  }

  private updateEquipoProyecto(): Observable<void> {
    const updateEquipos = this.proyectoEquipos$.value.filter((wrapper) => wrapper.value.id);
    if (updateEquipos.length === 0) {
      return of(void 0);
    }
    return from(updateEquipos).pipe(
      mergeMap((wrapped) => {
        const solicitudProyectoEquipo = wrapped.value;
        return this.solicitudProyectoEquipoService.update(solicitudProyectoEquipo.id, solicitudProyectoEquipo).pipe(
          map((updated) => {
            const index = this.proyectoEquipos$.value.findIndex((current) => current === wrapped);
            this.proyectoEquipos$.value[index] = new StatusWrapper<ISolicitudProyectoEquipo>(updated);
          })
        );
      })
    );
  }

  private createEquipoProyecto(): Observable<void> {
    const createdEquipos = this.proyectoEquipos$.value.filter((equipoProyecto) => !equipoProyecto.value.id);
    if (createdEquipos.length === 0) {
      return of(void 0);
    }
    return this.createEquipos(createdEquipos);
  }

  private createEquipos(
    createdEquipos: StatusWrapper<ISolicitudProyectoEquipo>[]
  ): Observable<void> {
    return from(createdEquipos).pipe(
      mergeMap((wrapped) => {
        const value = wrapped.value;
        value.solicitudProyectoId = this.getKey() as number;
        return this.solicitudProyectoEquipoService.create(value).pipe(
          map((solicitudProyectoEquipo) => {
            const index = this.proyectoEquipos$.value.findIndex((currenthitos) => currenthitos === wrapped);
            this.proyectoEquipos$.value[index] = new StatusWrapper<ISolicitudProyectoEquipo>(solicitudProyectoEquipo);
          })
        );
      }),
      takeLast(1)
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.proyectoEquipos$.value.some((wrapper) => wrapper.touched);
    return (this.proyectosEquipoEliminados.length > 0 || touched);
  }
}
