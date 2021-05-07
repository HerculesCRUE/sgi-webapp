import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { Fragment } from '@core/services/action-service';
import { ProyectoPeriodoSeguimientoService } from '@core/services/csp/proyecto-periodo-seguimiento.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { DocumentoService } from '@core/services/sgdoc/documento.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export class ProyectoPeriodoSeguimientosFragment extends Fragment {
  periodoSeguimientos$ = new BehaviorSubject<StatusWrapper<IProyectoPeriodoSeguimiento>[]>([]);
  private periodoSeguimientosEliminados: StatusWrapper<IProyectoPeriodoSeguimiento>[] = [];

  constructor(
    key: number,
    private proyectoService: ProyectoService,
    private proyectoPeriodoSeguimientoService: ProyectoPeriodoSeguimientoService,
    private documentoService: DocumentoService
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    if (this.getKey()) {
      this.proyectoService.findAllProyectoPeriodoSeguimientoProyecto(this.getKey() as number).pipe(
        map((response) => response.items)
      ).subscribe((periodoSeguimientos) => {
        this.periodoSeguimientos$.next(periodoSeguimientos.map(
          periodoSeguimiento => new StatusWrapper<IProyectoPeriodoSeguimiento>(periodoSeguimiento))
        );
      });
    }
  }

  public deletePeriodoSeguimiento(wrapper: StatusWrapper<IProyectoPeriodoSeguimiento>) {
    const current = this.periodoSeguimientos$.value;
    const index = current.findIndex(
      (value) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.periodoSeguimientosEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.periodoSeguimientos$.next(current);
      this.setChanges(true);
      this.recalcularNumPeriodos();
    }
  }

  saveOrUpdate(): Observable<void> {
    return this.deletePeriodoSeguimientos().pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      })
    );
  }

  private deletePeriodoSeguimientos(): Observable<void> {
    if (this.periodoSeguimientosEliminados.length === 0) {
      return of(void 0);
    }
    return from(this.periodoSeguimientosEliminados).pipe(
      mergeMap((wrapped) => {
        return this.proyectoPeriodoSeguimientoService.findDocumentos(wrapped.value.id).pipe(
          switchMap((documentos) => {
            return this.proyectoPeriodoSeguimientoService.deleteById(wrapped.value.id).pipe(
              tap(() => {
                this.periodoSeguimientosEliminados = this.periodoSeguimientosEliminados.filter(deletedPeriodoSeguimiento =>
                  deletedPeriodoSeguimiento.value.id !== wrapped.value.id),
                  map(() => {
                    return from(documentos.items).pipe(
                      mergeMap(documento => {
                        return this.documentoService.eliminarFichero(documento.documentoRef);
                      })
                    );
                  });
              }),
              takeLast(1)
            );
          })
        );
      })
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    return this.periodoSeguimientosEliminados.length > 0;
  }

  /**
   * Recalcula los numeros de los periodos de todos los periodos de seguimiento de la tabla en funcion de su fecha de inicio.
   */
  private recalcularNumPeriodos(): void {
    let numPeriodo = 1;
    this.periodoSeguimientos$.value
      .sort((a, b) => (a.value.fechaInicio > b.value.fechaInicio) ? 1 : ((b.value.fechaInicio > a.value.fechaInicio) ? -1 : 0));

    this.periodoSeguimientos$.value.forEach(c => {
      c.value.numPeriodo = numPeriodo++;
    });

    this.periodoSeguimientos$.next(this.periodoSeguimientos$.value);
  }

}
