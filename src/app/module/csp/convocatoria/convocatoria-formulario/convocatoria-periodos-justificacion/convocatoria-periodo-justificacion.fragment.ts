import { Fragment } from '@core/services/action-service';
import { BehaviorSubject, Observable, of, from, merge } from 'rxjs';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { IConvocatoriaPeriodoJustificacion } from '@core/models/csp/convocatoria-periodo-justificacion';
import { tap, map, mergeMap, takeLast } from 'rxjs/operators';
import { ConvocatoriaPeriodoJustificacionService } from '@core/services/csp/convocatoria-periodo-justificacion.service';
import { IConvocatoria } from '@core/models/csp/convocatoria';


export class ConvocatoriaPeriodosJustificacionFragment extends Fragment {

  periodosJustificacion$: BehaviorSubject<StatusWrapper<IConvocatoriaPeriodoJustificacion>[]>;
  periodosJustificacionEliminados: StatusWrapper<IConvocatoriaPeriodoJustificacion>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private readonly convocatoriaService: ConvocatoriaService,
    private readonly convocatoriaPeriodoJustificacionService: ConvocatoriaPeriodoJustificacionService
  ) {
    super(key);
    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.periodosJustificacion$ = new BehaviorSubject<StatusWrapper<IConvocatoriaPeriodoJustificacion>[]>([]);
    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, 'onInitialize()', 'start');
    if (this.getKey()) {
      this.convocatoriaService.getPeriodosJustificacion(this.getKey() as number).pipe(
        map((response) => {
          if (response.items) {
            return response.items;
          }
          else {
            return [];
          }
        })
      ).subscribe((periodosJustificacion) => {
        this.periodosJustificacion$.next(periodosJustificacion.map(
          periodoJustificacion => new StatusWrapper<IConvocatoriaPeriodoJustificacion>(periodoJustificacion))
        );
        this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, 'onInitialize()', 'end');
      });
    }
  }

  /**
   * Insertamos periodo justificacion
   *
   * @param periodoJustificacion Periodo de justificación
   */
  public addPeriodoJustificacion(periodoJustificacion: IConvocatoriaPeriodoJustificacion): void {
    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name,
      `${this.addPeriodoJustificacion.name}(${periodoJustificacion})`, 'start');

    const wrapped = new StatusWrapper<IConvocatoriaPeriodoJustificacion>(periodoJustificacion);
    wrapped.setCreated();
    const current = this.periodosJustificacion$.value;
    current.push(wrapped);
    this.periodosJustificacion$.next(current);
    this.setChanges(true);
    this.setErrors(false);

    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name,
      `${this.addPeriodoJustificacion.name}(${periodoJustificacion})`, 'end');
  }

  /**
   * Elimina el periodo justificacion de la tabla y se añade a la lista de eliminados
   *
   * @param periodoJustificacion Periodo de justificación
   */
  public deletePeriodoJustificacion(periodoJustificacion: StatusWrapper<IConvocatoriaPeriodoJustificacion>): void {
    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name,
      `${this.deletePeriodoJustificacion.name}(${periodoJustificacion})`, 'start');

    const current = this.periodosJustificacion$.value;
    const indexPeriodoJustificacion = current.findIndex(
      (value: StatusWrapper<IConvocatoriaPeriodoJustificacion>) => value === periodoJustificacion
    );

    if (indexPeriodoJustificacion === -1) {
      // Periodo justificacion no encontrado
      this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name,
        `${this.deletePeriodoJustificacion.name}(${periodoJustificacion})`, 'end');
      return;
    }

    if (!periodoJustificacion.created) {
      this.periodosJustificacionEliminados.push(current[indexPeriodoJustificacion]);
      this.setChanges(true);
    }

    current.splice(indexPeriodoJustificacion, 1);
    this.periodosJustificacion$.next(current);

    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name,
      `${this.deletePeriodoJustificacion.name}(${periodoJustificacion})`, 'end');
  }


  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, `${this.saveOrUpdate.name}()`, 'start');

    const periodosJustificacion = this.periodosJustificacion$.value.map(wrapper => wrapper.value);

    return this.convocatoriaPeriodoJustificacionService
      .updateConvocatoriaPeriodoJustificacionesConvocatoria(this.getKey() as number, periodosJustificacion).pipe(
        takeLast(1),
        map((peridosJustificacionActualizados) => {
          this.periodosJustificacionEliminados = [];
          this.periodosJustificacion$.next(
            peridosJustificacionActualizados
              .map(periodoJustificacion => new StatusWrapper<IConvocatoriaPeriodoJustificacion>(periodoJustificacion)));
        }),
        tap(() => {
          if (this.isSaveOrUpdateComplete()) {
            this.setChanges(false);
          }

          this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, `${this.saveOrUpdate.name}()`, 'end');
        })
      );
  }

  /**
   * Comprueba si se ejecutaron correctamente todos borrados, actualizaciones y creaciones.
   *
   * @returns true si no queda ningun cambio pendiente.
   */
  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');

    const hasTouched = this.periodosJustificacion$.value.some((wrapper) => wrapper.touched);
    const hasNoDeleted = this.periodosJustificacionEliminados.length > 0;

    this.logger.debug(ConvocatoriaPeriodosJustificacionFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');

    return !hasTouched && !hasNoDeleted;
  }

}
