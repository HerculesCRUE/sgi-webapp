import { IConvocatoriaSeguimientoCientifico } from '@core/models/csp/convocatoria-seguimiento-cientifico';
import { Fragment } from '@core/services/action-service';
import { ConvocatoriaSeguimientoCientificoService } from '@core/services/csp/convocatoria-seguimiento-cientifico.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeLast, tap } from 'rxjs/operators';

export class ConvocatoriaSeguimientoCientificoFragment extends Fragment {

  seguimientosCientificos$: BehaviorSubject<StatusWrapper<IConvocatoriaSeguimientoCientifico>[]>;
  seguimientosCientificosEliminados: StatusWrapper<IConvocatoriaSeguimientoCientifico>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private readonly convocatoriaService: ConvocatoriaService,
    private readonly convocatoriaSeguimientoCientificoService: ConvocatoriaSeguimientoCientificoService
  ) {
    super(key);
    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.seguimientosCientificos$ = new BehaviorSubject<StatusWrapper<IConvocatoriaSeguimientoCientifico>[]>([]);
    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, 'onInitialize()', 'start');
    if (this.getKey()) {
      this.convocatoriaService.findSeguimientosCientificos(this.getKey() as number).pipe(
        map((response) => {
          if (response.items) {
            return response.items;
          }
          else {
            return [];
          }
        })
      ).subscribe((seguimientosCientificos) => {
        this.seguimientosCientificos$.next(seguimientosCientificos.map(
          seguimientoCientifico => new StatusWrapper<IConvocatoriaSeguimientoCientifico>(seguimientoCientifico))
        );
        this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, 'onInitialize()', 'end');
      });
    }
  }

  /**
   * Insertamos seguimiento cientifico
   *
   * @param seguimientoCientifico seguimiento cientifico
   */
  public addSeguimientoCientifico(seguimientoCientifico: IConvocatoriaSeguimientoCientifico): void {
    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name,
      `${this.addSeguimientoCientifico.name}(${seguimientoCientifico})`, 'start');

    const wrapped = new StatusWrapper<IConvocatoriaSeguimientoCientifico>(seguimientoCientifico);
    wrapped.setCreated();
    const current = this.seguimientosCientificos$.value;
    current.push(wrapped);
    this.seguimientosCientificos$.next(current);
    this.setChanges(true);
    this.setErrors(false);

    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name,
      `${this.addSeguimientoCientifico.name}(${seguimientoCientifico})`, 'end');
  }

  /**
   * Elimina el seguimiento cientifico de la tabla y se añade a la lista de eliminados
   *
   * @param seguimientoCientifico seguimiento cientifico
   */
  public deleteSeguimientoCientifico(seguimientoCientifico: StatusWrapper<IConvocatoriaSeguimientoCientifico>): void {
    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name,
      `${this.deleteSeguimientoCientifico.name}(${seguimientoCientifico})`, 'start');

    const current = this.seguimientosCientificos$.value;
    const indexseguimientoCientifico = current.findIndex(
      (value: StatusWrapper<IConvocatoriaSeguimientoCientifico>) => value === seguimientoCientifico
    );

    if (!seguimientoCientifico.created) {
      this.seguimientosCientificosEliminados.push(current[indexseguimientoCientifico]);
      this.setChanges(true);
    }

    current.splice(indexseguimientoCientifico, 1);
    this.seguimientosCientificos$.next(current);

    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name,
      `${this.deleteSeguimientoCientifico.name}(${seguimientoCientifico})`, 'end');
  }


  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, `${this.saveOrUpdate.name}()`, 'start');

    const seguimientosCientificos = this.seguimientosCientificos$.value.map(wrapper => wrapper.value);

    return this.convocatoriaSeguimientoCientificoService
      .updateConvocatoriaSeguimientoCientificoConvocatoria(this.getKey() as number, seguimientosCientificos).pipe(
        takeLast(1),
        map((seguimientosCientificosActualizados) => {
          this.seguimientosCientificosEliminados = [];
          this.seguimientosCientificos$.next(
            seguimientosCientificosActualizados
              .map(seguimientoCientifico => new StatusWrapper<IConvocatoriaSeguimientoCientifico>(seguimientoCientifico)));
        }),
        tap(() => {
          if (this.isSaveOrUpdateComplete()) {
            this.setChanges(false);
          }

          this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, `${this.saveOrUpdate.name}()`, 'end');
        })
      );
  }

  /**
   * Comprueba si se ejecutaron correctamente todos borrados, actualizaciones y creaciones.
   *
   * @returns true si no queda ningun cambio pendiente.
   */
  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');

    const hasTouched = this.seguimientosCientificos$.value.some((wrapper) => wrapper.touched);
    const hasNoDeleted = this.seguimientosCientificosEliminados.length > 0;

    this.logger.debug(ConvocatoriaSeguimientoCientificoFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');

    return !hasTouched && !hasNoDeleted;
  }

}