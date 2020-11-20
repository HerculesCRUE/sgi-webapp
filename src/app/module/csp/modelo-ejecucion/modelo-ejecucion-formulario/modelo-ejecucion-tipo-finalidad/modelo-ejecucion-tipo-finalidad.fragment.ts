import { IModeloTipoFinalidad } from '@core/models/csp/modelo-tipo-finalidad';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { Fragment } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloTipoFinalidadService } from '@core/services/csp/modelo-tipo-finalidad.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';

export class ModeloEjecucionTipoFinalidadFragment extends Fragment {
  modeloTipoFinalidad$ = new BehaviorSubject<StatusWrapper<IModeloTipoFinalidad>[]>([]);
  modeloTipoFinalidadEliminados: StatusWrapper<IModeloTipoFinalidad>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private modeloEjecucionService: ModeloEjecucionService,
    private modeloTipoFinalidadService: ModeloTipoFinalidadService,
    actionService: ModeloEjecucionActionService,
  ) {
    super(key);
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.onInitialize.name}()`, 'start');
    if (this.getKey()) {
      this.modeloEjecucionService.findModeloTipoFinalidad(this.getKey() as number).pipe(
        map((response: SgiRestListResult<IModeloTipoFinalidad>) => response.items)
      ).subscribe(
        (modelosTipoFinalidades: IModeloTipoFinalidad[]) => {
          this.modeloTipoFinalidad$.next(
            modelosTipoFinalidades.map(
              modeloTipoFinalidad => new StatusWrapper<IModeloTipoFinalidad>(modeloTipoFinalidad)
            )
          );
        }
      );
    }
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.onInitialize.name}()`, 'end');
  }

  public addModeloTipoFinalidad(modeloTipoFinalidad: IModeloTipoFinalidad) {
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name,
      `${this.addModeloTipoFinalidad.name}(modeloTipoEnlace: ${modeloTipoFinalidad})`, 'start');
    const wrapped = new StatusWrapper<IModeloTipoFinalidad>(modeloTipoFinalidad);
    wrapped.setCreated();
    const current = this.modeloTipoFinalidad$.value;
    current.push(wrapped);
    this.modeloTipoFinalidad$.next(current);
    this.setChanges(true);
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name,
      `${this.addModeloTipoFinalidad.name}(modeloTipoEnlace: ${modeloTipoFinalidad})`, 'end');
  }

  public deleteModeloTipoFinalidad(wrapper: StatusWrapper<IModeloTipoFinalidad>) {
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name,
      `${this.deleteModeloTipoFinalidad.name}(wrapper: ${wrapper})`, 'start');
    const current = this.modeloTipoFinalidad$.value;
    const index = current.findIndex(
      (value: StatusWrapper<IModeloTipoFinalidad>) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.modeloTipoFinalidadEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.modeloTipoFinalidad$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name,
      `${this.deleteModeloTipoFinalidad.name}(wrapper: ${wrapper})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteModeloTipoFinalidades(),
      this.createModeloTipoFinalidades()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private deleteModeloTipoFinalidades(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.deleteModeloTipoFinalidades.name}()`, 'start');
    if (this.modeloTipoFinalidadEliminados.length === 0) {
      this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.deleteModeloTipoFinalidades.name}()`, 'end');
      return of(void 0);
    }
    return from(this.modeloTipoFinalidadEliminados).pipe(
      mergeMap((wrapped) => {
        return this.modeloTipoFinalidadService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.modeloTipoFinalidadEliminados = this.modeloTipoFinalidadEliminados.filter(deletedFinalidad =>
                deletedFinalidad.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name,
              `${this.deleteModeloTipoFinalidades.name}()`, 'end'))
          );
      }));
  }

  private createModeloTipoFinalidades(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.createModeloTipoFinalidades.name}()`, 'start');
    const createdModelos = this.modeloTipoFinalidad$.value.filter((modeloTipoEnlace) => modeloTipoEnlace.created);
    if (createdModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.createModeloTipoFinalidades.name}()`, 'end');
      return of(void 0);
    }
    createdModelos.forEach(
      (wrapper: StatusWrapper<IModeloTipoFinalidad>) => wrapper.value.modeloEjecucion = {
        id: this.getKey(),
        activo: true
      } as IModeloEjecucion
    );
    return from(createdModelos).pipe(
      mergeMap((wrapped) => {
        return this.modeloTipoFinalidadService.create(wrapped.value).pipe(
          map((updatedFinalidad) => {
            const index = this.modeloTipoFinalidad$.value.findIndex((currentTarea) => currentTarea === wrapped);
            this.modeloTipoFinalidad$[index] = new StatusWrapper<IModeloTipoFinalidad>(updatedFinalidad);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name,
            `${this.createModeloTipoFinalidades.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched = this.modeloTipoFinalidad$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ModeloEjecucionTipoFinalidadFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.modeloTipoFinalidadEliminados.length > 0 || touched);
  }

}
