import { IModeloTipoHito } from '@core/models/csp/modelo-tipo-hito';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { Fragment } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloTipoHitoService } from '@core/services/csp/modelo-tipo-hito.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';

export class ModeloEjecucionTipoHitoFragment extends Fragment {

  modeloTipoHito$ = new BehaviorSubject<StatusWrapper<IModeloTipoHito>[]>([]);
  modeloTipoHitoEliminados: StatusWrapper<IModeloTipoHito>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private modeloEjecucionService: ModeloEjecucionService,
    private modeloTipoHitoService: ModeloTipoHitoService,
    actionService: ModeloEjecucionActionService
  ) {
    super(key);
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.onInitialize.name}()`, 'start');
    if (this.getKey()) {
      this.modeloEjecucionService.findModeloTipoHito(this.getKey() as number).pipe(
        map((response: SgiRestListResult<IModeloTipoHito>) => response.items)
      ).subscribe(
        (modelosTipoHito: IModeloTipoHito[]) => {
          this.modeloTipoHito$.next(
            modelosTipoHito.map(modeloTipoHito => new StatusWrapper<IModeloTipoHito>(modeloTipoHito))
          );
        }
      );
    }
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.onInitialize.name}()`, 'end');
  }

  public addModeloTipoHito(modeloTipoHito: IModeloTipoHito) {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name,
      `${this.addModeloTipoHito.name}(modeloTipoHito: ${modeloTipoHito})`, 'start');
    const wrapped = new StatusWrapper<IModeloTipoHito>(modeloTipoHito);
    wrapped.setCreated();
    const current = this.modeloTipoHito$.value;
    current.push(wrapped);
    this.modeloTipoHito$.next(current);
    this.setChanges(true);
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name,
      `${this.addModeloTipoHito.name}(modeloTipoHito: ${modeloTipoHito})`, 'end');
  }

  public deleteModeloTipoHito(wrapper: StatusWrapper<IModeloTipoHito>) {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name,
      `${this.deleteModeloTipoHito.name}(wrapper: ${wrapper})`, 'start');
    const current = this.modeloTipoHito$.value;
    const index = current.findIndex(
      (value: StatusWrapper<IModeloTipoHito>) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.modeloTipoHitoEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.modeloTipoHito$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name,
      `${this.deleteModeloTipoHito.name}(wrapper: ${wrapper})`, 'end');
  }

  private deleteModeloTipoHitos(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.deleteModeloTipoHitos.name}()`, 'start');
    if (this.modeloTipoHitoEliminados.length === 0) {
      this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.deleteModeloTipoHitos.name}()`, 'end');
      return of(void 0);
    }
    return from(this.modeloTipoHitoEliminados).pipe(
      mergeMap((wrapped) => {
        return this.modeloTipoHitoService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.modeloTipoHitoEliminados = this.modeloTipoHitoEliminados.filter(deletedModelo =>
                deletedModelo.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ModeloEjecucionTipoHitoFragment.name,
              `${this.deleteModeloTipoHitos.name}()`, 'end'))
          );
      }));
  }

  private updateModeloTipoHitos(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.updateModeloTipoHitos.name}()`, 'start');
    const editedModelos = this.modeloTipoHito$.value.filter((modeloTipoHito) => modeloTipoHito.edited);
    if (editedModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.updateModeloTipoHitos.name}()`, 'end');
      return of(void 0);
    }
    return from(editedModelos).pipe(
      mergeMap((wrappedTarea) => {
        return this.modeloTipoHitoService.update(wrappedTarea.value.id, wrappedTarea.value).pipe(
          map((updatedTarea) => {
            const index = this.modeloTipoHito$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
            this.modeloTipoHito$.value[index] = new StatusWrapper<IModeloTipoHito>(updatedTarea);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoHitoFragment.name,
            `${this.updateModeloTipoHitos.name}()`, 'end'))
        );
      })
    );
  }

  private createModeloTipoHitos(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.createModeloTipoHitos.name}()`, 'start');
    const createdModelos = this.modeloTipoHito$.value.filter((modeloTipoHito) => modeloTipoHito.created);
    if (createdModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.createModeloTipoHitos.name}()`, 'end');
      return of(void 0);
    }
    createdModelos.forEach(
      (wrapper: StatusWrapper<IModeloTipoHito>) => wrapper.value.modeloEjecucion = {
        id: this.getKey(),
        activo: true
      } as IModeloEjecucion
    );
    return from(createdModelos).pipe(
      mergeMap((wrappedTarea) => {
        return this.modeloTipoHitoService.create(wrappedTarea.value).pipe(
          map((updatedTarea) => {
            const index = this.modeloTipoHito$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
            this.modeloTipoHito$[index] = new StatusWrapper<IModeloTipoHito>(updatedTarea);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoHitoFragment.name,
            `${this.createModeloTipoHitos.name}()`, 'end'))
        );
      }));
  }

  /**
   * Guardar form
   */
  saveOrUpdate(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteModeloTipoHitos(),
      this.updateModeloTipoHitos(),
      this.createModeloTipoHitos()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched: boolean = this.modeloTipoHito$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ModeloEjecucionTipoHitoFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.modeloTipoHitoEliminados.length > 0 || touched);
  }

}
