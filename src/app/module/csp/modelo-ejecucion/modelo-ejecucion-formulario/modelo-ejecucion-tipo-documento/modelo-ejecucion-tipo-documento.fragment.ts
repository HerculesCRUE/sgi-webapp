import { IModeloTipoDocumento } from '@core/models/csp/modelo-tipo-documento';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { Fragment } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloTipoDocumentoService } from '@core/services/csp/modelo-tipo-documento.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';

export class ModeloEjecucionTipoDocumentoFragment extends Fragment {
  modeloTipoDocumento$ = new BehaviorSubject<StatusWrapper<IModeloTipoDocumento>[]>([]);
  modeloTipoDocumentoEliminados: StatusWrapper<IModeloTipoDocumento>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private modeloEjecucionService: ModeloEjecucionService,
    private modeloTipoDocumentoService: ModeloTipoDocumentoService,
    private modeloEjecucionActionService: ModeloEjecucionActionService
  ) {
    super(key);
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `onInitialize()`, 'start');
    this.modeloEjecucionActionService.getFragment(this.modeloEjecucionActionService.FRAGMENT.TIPO_FASES).initialize();
    if (this.getKey()) {
      this.modeloEjecucionService.findModeloTipoDocumento(this.getKey() as number).pipe(
        map((response) => response.items)
      ).subscribe(
        (modelosTipoDocumento) => {
          this.modeloTipoDocumento$.next(
            modelosTipoDocumento.map(modeloTipoDocumento => new StatusWrapper<IModeloTipoDocumento>(modeloTipoDocumento))
          );
        }
      );
    }
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `onInitialize()`, 'end');
  }

  public addModeloTipoDocumento(modeloTipoDocumento: IModeloTipoDocumento): void {
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name,
      `addModeloTipoDocumento(modeloTipoDocumento: ${modeloTipoDocumento})`, 'start');
    const wrapped = new StatusWrapper<IModeloTipoDocumento>(modeloTipoDocumento);
    wrapped.setCreated();
    const current = this.modeloTipoDocumento$.value;
    current.push(wrapped);
    this.modeloTipoDocumento$.next(current);
    this.setChanges(true);
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name,
      `addModeloTipoDocumento(modeloTipoDocumento: ${modeloTipoDocumento})`, 'end');
  }

  public deleteModeloTipoDocumento(wrapper: StatusWrapper<IModeloTipoDocumento>): void {
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name,
      `deleteModeloTipoDocumento(wrapper: ${wrapper})`, 'start');
    const current = this.modeloTipoDocumento$.value;
    const index = current.findIndex((value) => value === wrapper);
    if (index >= 0) {
      if (!wrapper.created) {
        this.modeloTipoDocumentoEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.modeloTipoDocumento$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name,
      `deleteModeloTipoDocumento(wrapper: ${wrapper})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `saveOrUpdate()`, 'start');
    return merge(
      this.deleteModeloTipoDocumentos(),
      this.createModeloTipoDocumentos()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `saveOrUpdate()`, 'end'))
    );
  }

  private deleteModeloTipoDocumentos(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `deleteModeloTipoDocumentos()`, 'start');
    if (this.modeloTipoDocumentoEliminados.length === 0) {
      this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `deleteModeloTipoDocumentos()`, 'end');
      return of(void 0);
    }
    return from(this.modeloTipoDocumentoEliminados).pipe(
      mergeMap((wrapped) => {
        return this.modeloTipoDocumentoService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.modeloTipoDocumentoEliminados = this.modeloTipoDocumentoEliminados.filter(deletedModelo =>
                deletedModelo.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name,
              `deleteModeloTipoDocumentos()`, 'end'))
          );
      }));
  }

  private createModeloTipoDocumentos(): Observable<void> {
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `createModeloTipoDocumentos()`, 'start');
    let createdModelos = this.modeloTipoDocumento$.value.filter((modeloTipoDocumento) => modeloTipoDocumento.created);
    if (createdModelos.length === 0) {
      this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `createModeloTipoDocumentos()`, 'end');
      return of(void 0);
    }
    const modeloTipoFases = this.modeloEjecucionActionService.getModeloTipoFases();
    createdModelos.forEach((wrapper) => {
      wrapper.value.modeloEjecucion = {
        id: this.getKey(),
        activo: true
      } as IModeloEjecucion;
      const fase = modeloTipoFases.find(element =>
        element.tipoFase.id === wrapper.value.modeloTipoFase.tipoFase.id);
      wrapper.value.modeloTipoFase = fase;
    });
    createdModelos = createdModelos.filter(x => x.value.modeloTipoFase);
    return from(createdModelos).pipe(
      mergeMap((wrappedTarea) => {
        return this.modeloTipoDocumentoService.create(wrappedTarea.value).pipe(
          map((updatedTarea) => {
            const index = this.modeloTipoDocumento$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
            this.modeloTipoDocumento$.value[index] = new StatusWrapper<IModeloTipoDocumento>(updatedTarea);
          }),
          tap(() => this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name,
            `createModeloTipoDocumentos()`, 'end'))
        );
      })
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `isSaveOrUpdateComplete()`, 'start');
    const touched: boolean = this.modeloTipoDocumento$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ModeloEjecucionTipoDocumentoFragment.name, `isSaveOrUpdateComplete()`, 'end');
    return (this.modeloTipoDocumentoEliminados.length > 0 || touched);
  }

}
