import { OnDestroy } from '@angular/core';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { Fragment } from '@core/services/action-service';
import { ConvocatoriaEntidadFinanciadoraService } from '@core/services/csp/convocatoria-entidad-financiadora.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';

export class ConvocatoriaEntidadesFinanciadorasFragment extends Fragment implements OnDestroy {
  convocatoriaEntidadesFinanciadoras$ = new BehaviorSubject<StatusWrapper<IConvocatoriaEntidadFinanciadora>[]>([]);
  convocatoriaEntidadesEliminadas: StatusWrapper<IConvocatoriaEntidadFinanciadora>[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private readonly convocatoriaService: ConvocatoriaService,
    private readonly convocatoriaEntidadFinanciadoraService: ConvocatoriaEntidadFinanciadoraService
  ) {
    super(key);
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, 'constructor()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, 'ngOnDestroy()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.onInitialize.name}()`, 'start');
    if (this.getKey()) {
      const subscription = this.convocatoriaService.findEntidadesFinanciadoras(this.getKey() as number).pipe(
        map(response => response.items)
      ).subscribe(convocatoriaEntidadesFinanciadoras => {
        this.convocatoriaEntidadesFinanciadoras$.next(convocatoriaEntidadesFinanciadoras.map(
          entidadesFinanciadora => new StatusWrapper<IConvocatoriaEntidadFinanciadora>(entidadesFinanciadora))
        );
        this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.onInitialize.name}()`, 'end');
      });
      this.subscriptions.push(subscription);
    }
  }

  public deleteConvocatoriaEntidadFinanciadora(wrapper: StatusWrapper<IConvocatoriaEntidadFinanciadora>) {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
      `${this.deleteConvocatoriaEntidadFinanciadora.name}(wrapper: ${wrapper})`, 'start');
    const current = this.convocatoriaEntidadesFinanciadoras$.value;
    const index = current.findIndex(value => value.value.id === wrapper.value.id);
    if (index >= 0) {
      if (!wrapper.created) {
        this.convocatoriaEntidadesEliminadas.push(current[index]);
      }
      current.splice(index, 1);
      this.convocatoriaEntidadesFinanciadoras$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
      `${this.deleteConvocatoriaEntidadFinanciadora.name}(wrapper: ${wrapper})`, 'end');
  }

  public updateConvocatoriaEntidadFinanciadora(wrapper: StatusWrapper<IConvocatoriaEntidadFinanciadora>) {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
      `${this.updateConvocatoriaEntidadFinanciadora.name}(wrapper: ${wrapper})`, 'start');
    const current = this.convocatoriaEntidadesFinanciadoras$.value;
    const index = current.findIndex(value => value.value.id === wrapper.value.id);
    if (index >= 0) {
      wrapper.setEdited();
      this.convocatoriaEntidadesFinanciadoras$.value[index] = wrapper;
      this.setChanges(true);
    }
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
      `${this.updateConvocatoriaEntidadFinanciadora.name}(wrapper: ${wrapper})`, 'end');
  }

  public addConvocatoriaEntidadFinanciadora(entidadFinanciadora: IConvocatoriaEntidadFinanciadora) {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
      `${this.addConvocatoriaEntidadFinanciadora.name}(entidadFinanciadora: ${entidadFinanciadora})`, 'start');
    const wrapped = new StatusWrapper<IConvocatoriaEntidadFinanciadora>(entidadFinanciadora);
    wrapped.setCreated();
    const current = this.convocatoriaEntidadesFinanciadoras$.value;
    current.push(wrapped);
    this.convocatoriaEntidadesFinanciadoras$.next(current);
    this.setChanges(true);
    this.setErrors(false);
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
      `${this.addConvocatoriaEntidadFinanciadora.name}(entidadFinanciadora: ${entidadFinanciadora})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteConvocatoriaEntidadFinanciadoras(),
      this.updateConvocatoriaEntidadFinanciadoras(),
      this.createConvocatoriaEntidadFinanciadoras()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private deleteConvocatoriaEntidadFinanciadoras(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.deleteConvocatoriaEntidadFinanciadoras.name}()`, 'start');
    const deletedEntidades = this.convocatoriaEntidadesEliminadas.filter((value) => value.value.id);
    if (deletedEntidades.length === 0) {
      this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.deleteConvocatoriaEntidadFinanciadoras.name}()`, 'end');
      return of(void 0);
    }
    return from(deletedEntidades).pipe(
      mergeMap((wrapped) => {
        return this.convocatoriaEntidadFinanciadoraService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.convocatoriaEntidadesEliminadas = deletedEntidades.filter(deletedModelo =>
                deletedModelo.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
              `${this.deleteConvocatoriaEntidadFinanciadoras.name}()`, 'end'))
          );
      })
    );
  }

  private updateConvocatoriaEntidadFinanciadoras(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.updateConvocatoriaEntidadFinanciadoras.name}()`, 'start');
    const editedEntidades = this.convocatoriaEntidadesFinanciadoras$.value.filter((value) => value.edited);
    if (editedEntidades.length === 0) {
      this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.updateConvocatoriaEntidadFinanciadoras.name}()`, 'end');
      return of(void 0);
    }
    return from(editedEntidades).pipe(
      mergeMap((wrapped) => {
        return this.convocatoriaEntidadFinanciadoraService.update(wrapped.value.id, wrapped.value).pipe(
          map((updatedEntidad) => {
            const index = this.convocatoriaEntidadesFinanciadoras$.value.findIndex((currentEntidad) => currentEntidad === wrapped);
            this.convocatoriaEntidadesFinanciadoras$.value[index] = new StatusWrapper<IConvocatoriaEntidadFinanciadora>(updatedEntidad);
          }),
          tap(() => this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
            `${this.updateConvocatoriaEntidadFinanciadoras.name}()`, 'end')
          )
        );
      })
    );
  }

  private createConvocatoriaEntidadFinanciadoras(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.createConvocatoriaEntidadFinanciadoras.name}()`, 'start');
    const createdEntidades = this.convocatoriaEntidadesFinanciadoras$.value.filter((value) => value.created);
    if (createdEntidades.length === 0) {
      this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.createConvocatoriaEntidadFinanciadoras.name}()`, 'end');
      return of(void 0);
    }
    createdEntidades.forEach(
      (wrapper: StatusWrapper<IConvocatoriaEntidadFinanciadora>) => wrapper.value.convocatoria = {
        id: this.getKey(),
        activo: true
      } as IConvocatoria
    );
    return from(createdEntidades).pipe(
      mergeMap((wrapped) => {
        return this.convocatoriaEntidadFinanciadoraService.create(wrapped.value).pipe(
          map((createdEntidad) => {
            const index = this.convocatoriaEntidadesFinanciadoras$.value.findIndex((currentEntidad) => currentEntidad === wrapped);
            this.convocatoriaEntidadesFinanciadoras$[index] = new StatusWrapper<IConvocatoriaEntidadFinanciadora>(createdEntidad);
          }),
          tap(() => this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name,
            `${this.createConvocatoriaEntidadFinanciadoras.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched: boolean = this.convocatoriaEntidadesFinanciadoras$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.convocatoriaEntidadesEliminadas.length > 0 || touched);
  }
}
