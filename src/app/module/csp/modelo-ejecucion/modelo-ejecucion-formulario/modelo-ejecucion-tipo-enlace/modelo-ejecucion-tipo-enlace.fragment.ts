import { IModeloTipoEnlace } from '@core/models/csp/modelo-tipo-enlace';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { Fragment } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloTipoEnlaceService } from '@core/services/csp/modelo-tipo-enlace.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';

export class ModeloEjecucionTipoEnlaceFragment extends Fragment {
  modeloTipoEnlace$ = new BehaviorSubject<StatusWrapper<IModeloTipoEnlace>[]>([]);
  modeloTipoEnlaceEliminados: StatusWrapper<IModeloTipoEnlace>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private modeloEjecucionService: ModeloEjecucionService,
    private modeloTipoEnlaceService: ModeloTipoEnlaceService,
    actionService: ModeloEjecucionActionService
  ) {
    super(key);
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.onInitialize.name}()`, 'start');
    if (this.getKey()) {
      this.modeloEjecucionService.findModeloTipoEnlace(this.getKey() as number).pipe(
        map((response: SgiRestListResult<IModeloTipoEnlace>) => response.items)
      ).subscribe(
        (modelosTipoEnlace: IModeloTipoEnlace[]) => {
          this.modeloTipoEnlace$.next(
            modelosTipoEnlace.map(modeloTipoEnlace => new StatusWrapper<IModeloTipoEnlace>(modeloTipoEnlace))
          );
        }
      );
    }
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.onInitialize.name}()`, 'end');
  }

  public addModeloTipoEnlace(modeloTipoEnlace: IModeloTipoEnlace) {
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name,
      `${this.addModeloTipoEnlace.name}(modeloTipoEnlace: ${modeloTipoEnlace})`, 'start');
    const wrapped = new StatusWrapper<IModeloTipoEnlace>(modeloTipoEnlace);
    wrapped.setCreated();
    const current = this.modeloTipoEnlace$.value;
    current.push(wrapped);
    this.modeloTipoEnlace$.next(current);
    this.setChanges(true);
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name,
      `${this.addModeloTipoEnlace.name}(modeloTipoEnlace: ${modeloTipoEnlace})`, 'end');
  }

  public deleteModeloTipoEnlace(wrapper: StatusWrapper<IModeloTipoEnlace>) {
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name,
      `${this.deleteModeloTipoEnlace.name}(wrapper: ${wrapper})`, 'start');
    const current = this.modeloTipoEnlace$.value;
    const index = current.findIndex(
      (value: StatusWrapper<IModeloTipoEnlace>) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.modeloTipoEnlaceEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.modeloTipoEnlace$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name,
      `${this.deleteModeloTipoEnlace.name}(wrapper: ${wrapper})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteModeloTipoEnlaces(),
      this.createModeloTipoEnlaces()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private deleteModeloTipoEnlaces(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.deleteModeloTipoEnlaces.name}()`, 'start');
    if (this.modeloTipoEnlaceEliminados.length === 0) {
      this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.deleteModeloTipoEnlaces.name}()`, 'end');
      return of(void 0);
    }
    return from(this.modeloTipoEnlaceEliminados).pipe(
      mergeMap((wrapped) => {
        return this.modeloTipoEnlaceService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.modeloTipoEnlaceEliminados = this.modeloTipoEnlaceEliminados.filter(deletedModelo =>
                deletedModelo.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name,
              `${this.deleteModeloTipoEnlaces.name}()`, 'end'))
          );
      }));
  }

  private createModeloTipoEnlaces(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.createModeloTipoEnlaces.name}()`, 'start');
    const createdModelos = this.modeloTipoEnlace$.value.filter((modeloTipoEnlace) => modeloTipoEnlace.created);
    if (createdModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.createModeloTipoEnlaces.name}()`, 'end');
      return of(void 0);
    }
    createdModelos.forEach(
      (wrapper: StatusWrapper<IModeloTipoEnlace>) => wrapper.value.modeloEjecucion = {
        id: this.getKey(),
        activo: true
      } as IModeloEjecucion
    );
    return from(createdModelos).pipe(
      mergeMap((wrappedTarea) => {
        return this.modeloTipoEnlaceService.create(wrappedTarea.value).pipe(
          map((updatedTarea) => {
            const index = this.modeloTipoEnlace$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
            this.modeloTipoEnlace$[index] = new StatusWrapper<IModeloTipoEnlace>(updatedTarea);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name,
            `${this.createModeloTipoEnlaces.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched: boolean = this.modeloTipoEnlace$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ModeloEjecucionTipoEnlaceFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.modeloTipoEnlaceEliminados.length > 0 || touched);
  }

}
