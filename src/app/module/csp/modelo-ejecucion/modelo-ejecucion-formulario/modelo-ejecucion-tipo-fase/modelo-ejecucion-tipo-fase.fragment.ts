import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { Fragment } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloTipoFaseService } from '@core/services/csp/modelo-tipo-fase.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';

export class ModeloEjecucionTipoFaseFragment extends Fragment {

  modeloTipoFase$ = new BehaviorSubject<StatusWrapper<IModeloTipoFase>[]>([]);
  modeloTipoFaseEliminados: StatusWrapper<IModeloTipoFase>[] = [];

  constructor(
    private logger: NGXLogger,
    key: number,
    private modeloEjecucionService: ModeloEjecucionService,
    private modeloTipoFaseService: ModeloTipoFaseService
  ) {
    super(key);
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `onInitialize()`, 'start');
    if (this.getKey()) {
      this.modeloEjecucionService.findModeloTipoFase(this.getKey() as number).pipe(
        map((response: SgiRestListResult<IModeloTipoFase>) => response.items)
      ).subscribe(
        (modelosTipoFase) => {
          this.modeloTipoFase$.next(
            modelosTipoFase.map(modeloTipoFase => new StatusWrapper<IModeloTipoFase>(modeloTipoFase))
          );
        }
      );
    }
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `onInitialize()`, 'end');
  }

  /**
   * Añadir tipo fase
   */
  addModeloTipoFase(modeloTipoFase: IModeloTipoFase) {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name,
      `addModeloTipoFase(modeloTipoFase: ${modeloTipoFase})`, 'start');
    const wrapped = new StatusWrapper<IModeloTipoFase>(modeloTipoFase);
    wrapped.setCreated();
    const current = this.modeloTipoFase$.value;
    current.push(wrapped);
    this.modeloTipoFase$.next(current);
    this.setChanges(true);
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name,
      `addModeloTipoFase(modeloTipoFase: ${modeloTipoFase})`, 'end');
  }

  /**
   * Borrar modelo tipo fase
   */
  deleteModeloTipoFase(wrapper: StatusWrapper<IModeloTipoFase>) {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name,
      `deleteModeloTipoFase(wrapper: ${wrapper})`, 'start');
    const current = this.modeloTipoFase$.value;
    const index = current.findIndex(
      (value: StatusWrapper<IModeloTipoFase>) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.modeloTipoFaseEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.modeloTipoFase$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name,
      `deleteModeloTipoFase(wrapper: ${wrapper})`, 'end');
  }

  /**
   * Borrar modelo tipo fases
   */
  private deleteModeloTipoFases(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `deleteModeloTipoFases()`, 'start');
    if (this.modeloTipoFaseEliminados.length === 0) {
      this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `deleteModeloTipoFases()`, 'end');
      return of(void 0);
    }
    return from(this.modeloTipoFaseEliminados).pipe(
      mergeMap((wrapped) => {
        return this.modeloTipoFaseService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.modeloTipoFaseEliminados = this.modeloTipoFaseEliminados.filter(deletedModelo =>
                deletedModelo.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ModeloEjecucionTipoFaseFragment.name,
              `deleteModeloTipoFases()`, 'end'))
          );
      })
    );
  }

  /**
   * Actualiza modelo tipos fases
   */
  private updatedModeloTipoFases(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `updatedModeloTipoFases()`, 'start');
    const updatedModelos = this.modeloTipoFase$.value.filter((modeloTipoFase) => modeloTipoFase.edited);
    if (updatedModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `updatedModeloTipoFases()`, 'end');
      return of(void 0);
    }
    return from(updatedModelos).pipe(
      mergeMap((wrappedTarea) => {
        return this.modeloTipoFaseService.update(wrappedTarea.value.id, wrappedTarea.value).pipe(
          map((updatedTarea) => {
            const index = this.modeloTipoFase$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
            this.modeloTipoFase$.value[index] = new StatusWrapper<IModeloTipoFase>(updatedTarea);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoFaseFragment.name,
            `updatedModeloTipoFases()`, 'end'))
        );
      })
    );
  }

  /**
   * Crear modelo tipos fases
   */
  private createModeloTipoFases(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `createModeloTipoFases()`, 'start');
    const createdModelos = this.modeloTipoFase$.value.filter((modeloTipoFase) => modeloTipoFase.created);
    if (createdModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `createModeloTipoFases()`, 'end');
      return of(void 0);
    }
    createdModelos.forEach(
      (wrapper: StatusWrapper<IModeloTipoFase>) => wrapper.value.modeloEjecucion = {
        id: this.getKey(),
        activo: true
      } as IModeloEjecucion
    );
    return from(createdModelos).pipe(
      mergeMap((wrappedTarea) => {
        return this.modeloTipoFaseService.create(wrappedTarea.value).pipe(
          map((updatedTarea) => {
            const index = this.modeloTipoFase$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
            this.modeloTipoFase$.value[index] = new StatusWrapper<IModeloTipoFase>(updatedTarea);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoFaseFragment.name,
            `createModeloTipoFases()`, 'end'))
        );
      })
    );
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `saveOrUpdate()`, 'start');
    return merge(
      this.deleteModeloTipoFases(),
      this.updatedModeloTipoFases(),
      this.createModeloTipoFases()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `saveOrUpdate()`, 'end'))
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `isSaveOrUpdateComplete()`, 'start');
    const touched: boolean = this.modeloTipoFase$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ModeloEjecucionTipoFaseFragment.name, `isSaveOrUpdateComplete()`, 'end');
    return (this.modeloTipoFaseEliminados.length > 0 || touched);
  }

}
