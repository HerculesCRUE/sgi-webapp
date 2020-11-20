import { IModeloUnidad } from '@core/models/csp/modelo-unidad';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { Fragment } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiRestListResult, SgiRestFilterType, SgiRestFilter, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of, zip } from 'rxjs';
import { map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';

export class ModeloEjecucionTipoUnidadGestionFragment extends Fragment {

  modeloUnidad$ = new BehaviorSubject<StatusWrapper<IModeloUnidad>[]>([]);
  private modeloUnidadEliminados: StatusWrapper<IModeloUnidad>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private modeloEjecucionService: ModeloEjecucionService,
    private modeloUnidadService: ModeloUnidadService,
    private unidadGestionService: UnidadGestionService,
    actionService: ModeloEjecucionActionService,
  ) {
    super(key);
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.onInitialize.name}()`, 'start');
    if (this.getKey()) {

      this.modeloEjecucionService.findModeloTipoUnidadGestion(this.getKey() as number).pipe(
        switchMap((response: SgiRestListResult<IModeloUnidad>) => {

          const modeloUnidadObservable = response.items.
            map(modeloTipoHito => {
              const options = {
                filters: [
                  {
                    field: 'acronimo',
                    type: SgiRestFilterType.LIKE,
                    value: modeloTipoHito.unidadGestion.acronimo,
                  } as SgiRestFilter
                ]
              } as SgiRestFindOptions;
              return this.unidadGestionService.findAll(options).pipe(
                map(unidadesGestion => {
                  modeloTipoHito.unidadGestion = unidadesGestion.items[0];
                  return modeloTipoHito;
                }),
              );
            });

          return zip(...modeloUnidadObservable);

        })
      ).subscribe(
        (modelosUnidad: IModeloUnidad[]) => {
          this.modeloUnidad$.next(modelosUnidad.map(modeloUnidad => new StatusWrapper<IModeloUnidad>(modeloUnidad)));
        }
      );
      this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.onInitialize.name}()`, 'end');
    }
  }

  public addmodeloTipoUnidad(modeloTipoUnidad: IModeloUnidad) {
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name,
      `${this.addmodeloTipoUnidad.name}(modeloTipoUnidad: ${modeloTipoUnidad})`, 'start');
    const wrapped = new StatusWrapper<IModeloUnidad>(modeloTipoUnidad);
    wrapped.setCreated();
    const current = this.modeloUnidad$.value;
    current.push(wrapped);
    this.modeloUnidad$.next(current);
    this.setChanges(true);
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name,
      `${this.addmodeloTipoUnidad.name}(modeloTipoUnidad: ${modeloTipoUnidad})`, 'end');
  }

  public deletemodeloTipoUnidad(wrapper: StatusWrapper<IModeloUnidad>) {
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name,
      `${this.deletemodeloTipoUnidad.name}(wrapper: ${wrapper})`, 'start');
    const current = this.modeloUnidad$.value;
    const index = current.findIndex(
      (value: StatusWrapper<IModeloUnidad>) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.modeloUnidadEliminados.push(wrapper);
      }
      current.splice(index, 1);
      this.modeloUnidad$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name,
      `${this.deletemodeloTipoUnidad.name}(wrapper: ${wrapper})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deletemodeloTipoUnidades(),
      this.createModeloTipoUnidades()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private deletemodeloTipoUnidades(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.deletemodeloTipoUnidades.name}()`, 'start');
    if (this.modeloUnidadEliminados.length === 0) {
      this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.deletemodeloTipoUnidades.name}()`, 'end');
      return of(void 0);
    }
    return from(this.modeloUnidadEliminados).pipe(
      mergeMap((wrapped) => {
        return this.modeloUnidadService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.modeloUnidadEliminados = this.modeloUnidadEliminados.filter(deletedUnidad =>
                deletedUnidad.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name,
              `${this.deletemodeloTipoUnidades.name}()`, 'end'))
          );
      }));
  }

  private createModeloTipoUnidades(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.createModeloTipoUnidades.name}()`, 'start');
    const createdModelos = this.modeloUnidad$.value.filter((modeloTipoUnidad) => modeloTipoUnidad.created);
    if (createdModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.createModeloTipoUnidades.name}()`, 'end');
      return of(void 0);
    }
    createdModelos.forEach(
      (wrapper: StatusWrapper<IModeloUnidad>) => wrapper.value.modeloEjecucion = {
        id: this.getKey(),
        activo: true
      } as IModeloEjecucion
    );
    return from(createdModelos).pipe(
      mergeMap((wrapped) => {
        return this.modeloUnidadService.create(wrapped.value).pipe(
          map((updatedUnidad) => {
            const index = this.modeloUnidad$.value.findIndex((currentTarea) => currentTarea === wrapped);
            this.modeloUnidad$.value[index] = new StatusWrapper<IModeloUnidad>(updatedUnidad);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name,
            `${this.createModeloTipoUnidades.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched = this.modeloUnidad$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ModeloEjecucionTipoUnidadGestionFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.modeloUnidadEliminados.length > 0 || touched);
  }

}
