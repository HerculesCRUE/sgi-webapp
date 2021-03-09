import { ISolicitudProyectoPeriodoJustificacion } from '@core/models/csp/solicitud-proyecto-periodo-justificacion';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { Fragment } from '@core/services/action-service';
import { SolicitudProyectoPeriodoJustificacionService } from '@core/services/csp/solicitud-proyecto-periodo-justificacion.service';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeLast, tap } from 'rxjs/operators';

export class SolicitudProyectoPeriodoJustificacionesFragment extends Fragment {
  periodoJustificaciones$ = new BehaviorSubject<StatusWrapper<ISolicitudProyectoPeriodoJustificacion>[]>([]);

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private solicitudProyectoSocioService: SolicitudProyectoSocioService,
    private solicitudProyectoPeriodoJustificacionService: SolicitudProyectoPeriodoJustificacionService,
    public readonly
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    if (this.getKey()) {
      const id = this.getKey() as number;
      this.subscriptions.push(
        this.solicitudProyectoSocioService.findAllSolicitudProyectoPeriodoJustificacion(id).pipe(
          map(response => response.items),
        ).subscribe(
          result => {
            this.periodoJustificaciones$.next(
              result.map(value => new StatusWrapper<ISolicitudProyectoPeriodoJustificacion>(value))
            );
          },
          error => {
            this.logger.error(error);
          }
        )
      );
    }
  }

  addPeriodoJustificacion(element: ISolicitudProyectoPeriodoJustificacion): void {
    const wrapped = new StatusWrapper<ISolicitudProyectoPeriodoJustificacion>(element);
    wrapped.setCreated();
    const current = this.periodoJustificaciones$.value;
    current.push(wrapped);
    this.recalcularNumPeriodos(current);
  }

  deletePeriodoJustificacion(wrapper: StatusWrapper<ISolicitudProyectoPeriodoJustificacion>): void {
    const current = this.periodoJustificaciones$.value;
    const index = current.findIndex((value) => value === wrapper);
    if (index >= 0) {
      current.splice(index, 1);
      this.recalcularNumPeriodos(current);
    }
  }

  saveOrUpdate(): Observable<void> {
    const id = this.getKey() as number;
    const values = this.periodoJustificaciones$.value.map(wrapper => {
      wrapper.value.solicitudProyectoSocio = { id } as ISolicitudProyectoSocio;
      return wrapper.value;
    });
    return this.solicitudProyectoPeriodoJustificacionService.updateList(id, values).pipe(
      takeLast(1),
      map((results) => {
        this.periodoJustificaciones$.next(
          results.map(value => new StatusWrapper<ISolicitudProyectoPeriodoJustificacion>(value)));
      }),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      })
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    const hasTouched = this.periodoJustificaciones$.value.some((wrapper) => wrapper.touched);
    return !hasTouched;
  }

  private recalcularNumPeriodos(current: StatusWrapper<ISolicitudProyectoPeriodoJustificacion>[]): void {
    let numPeriodo = 1;
    current.sort((a, b) =>
      (a.value.mesInicial > b.value.mesInicial) ? 1 : ((b.value.mesInicial > a.value.mesInicial) ? -1 : 0));
    current.forEach(element => element.value.numPeriodo = numPeriodo++);
    this.periodoJustificaciones$.next(current);
    this.setChanges(true);
  }

  updatePeriodoJustificacion(wrapper: StatusWrapper<ISolicitudProyectoPeriodoJustificacion>): void {
    if (!wrapper.created) {
      wrapper.setEdited();
    }
    const current = this.periodoJustificaciones$.value;
    this.recalcularNumPeriodos(current);
  }
}
