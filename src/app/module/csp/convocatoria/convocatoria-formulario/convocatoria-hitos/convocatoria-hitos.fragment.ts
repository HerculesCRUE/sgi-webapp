import { Fragment } from '@core/services/action-service';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { BehaviorSubject, from, merge, Observable, of, Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaHitoService } from '@core/services/csp/convocatoria-hito.service';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { OnDestroy } from '@angular/core';

export class ConvocatoriaHitosFragment extends Fragment implements OnDestroy {
  hitos$ = new BehaviorSubject<StatusWrapper<IConvocatoriaHito>[]>([]);
  private hitosEliminados: StatusWrapper<IConvocatoriaHito>[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private readonly convocatoriaService: ConvocatoriaService,
    private readonly convocatoriaHitoService: ConvocatoriaHitoService
  ) {
    super(key);
    this.setComplete(true);
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaHitosFragment.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaHitosFragment.name, 'ngOnDestroy()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ConvocatoriaHitosFragment.name, 'onInitialize()', 'start');
    if (this.getKey()) {
      this.convocatoriaService.findHitosConvocatoria(this.getKey() as number).pipe(
        map((response) => response.items)
      ).subscribe((hitos) => {
        this.hitos$.next(hitos.map(
          listaHitos => new StatusWrapper<IConvocatoriaHito>(listaHitos))
        );
        this.logger.debug(ConvocatoriaHitosFragment.name, 'onInitialize()', 'end');
      });
    }
  }

  public addHito(hito: IConvocatoriaHito) {
    this.logger.debug(ConvocatoriaHitosFragment.name,
      `${this.addHito.name}(addHito: ${hito})`, 'start');
    const wrapped = new StatusWrapper<IConvocatoriaHito>(hito);
    wrapped.setCreated();
    const current = this.hitos$.value;
    current.push(wrapped);
    this.hitos$.next(current);
    this.setChanges(true);
    this.logger.debug(ConvocatoriaHitosFragment.name,
      `${this.addHito.name}(addHito: ${hito})`, 'end');
  }

  public deleteHito(wrapper: StatusWrapper<IConvocatoriaHito>) {
    this.logger.debug(ConvocatoriaHitosFragment.name,
      `${this.deleteHito.name}(wrapper: ${wrapper})`, 'start');
    const current = this.hitos$.value;
    const index = current.findIndex(
      (value) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.hitosEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.hitos$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ConvocatoriaHitosFragment.name,
      `${this.deleteHito.name}(wrapper: ${wrapper})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaHitosFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteHitos(),
      this.updateHitos(),
      this.createHitos()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ConvocatoriaHitosFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private deleteHitos(): Observable<void> {
    this.logger.debug(ConvocatoriaHitosFragment.name, `${this.deleteHitos.name}()`, 'start');
    if (this.hitosEliminados.length === 0) {
      this.logger.debug(ConvocatoriaHitosFragment.name, `${this.deleteHitos.name}()`, 'end');
      return of(void 0);
    }
    return from(this.hitosEliminados).pipe(
      mergeMap((wrapped) => {
        return this.convocatoriaHitoService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.hitosEliminados = this.hitosEliminados.filter(deletedHito =>
                deletedHito.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ConvocatoriaHitosFragment.name,
              `${this.deleteHitos.name}()`, 'end'))
          );
      }));
  }

  private createHitos(): Observable<void> {
    this.logger.debug(ConvocatoriaHitosFragment.name, `${this.createHitos.name}()`, 'start');
    const createdHitos = this.hitos$.value.filter((convocatoriaHito) => convocatoriaHito.created);
    if (createdHitos.length === 0) {
      this.logger.debug(ConvocatoriaHitosFragment.name, `${this.createHitos.name}()`, 'end');
      return of(void 0);
    }
    createdHitos.forEach(
      (wrapper) => wrapper.value.convocatoria = {
        id: this.getKey(),
        activo: true
      } as IConvocatoria
    );
    return from(createdHitos).pipe(
      mergeMap((wrappedHitos) => {
        return this.convocatoriaHitoService.create(wrappedHitos.value).pipe(
          map((updatedHitos) => {
            const index = this.hitos$.value.findIndex((currenthitos) => currenthitos === wrappedHitos);
            this.hitos$.value[index] = new StatusWrapper<IConvocatoriaHito>(updatedHitos);
          }),
          tap(() => this.logger.debug(ConvocatoriaHitosFragment.name,
            `${this.createHitos.name}()`, 'end'))
        );
      }));
  }

  private updateHitos(): Observable<void> {
    this.logger.debug(ConvocatoriaHitosFragment.name, `${this.updateHitos.name}()`, 'start');
    const updateHitos = this.hitos$.value.filter((convocatoriaHito) => convocatoriaHito.edited);
    if (updateHitos.length === 0) {
      this.logger.debug(ConvocatoriaHitosFragment.name, `${this.updateHitos.name}()`, 'end');
      return of(void 0);
    }
    return from(updateHitos).pipe(
      mergeMap((wrappedHitos) => {
        return this.convocatoriaHitoService.update(wrappedHitos.value.id, wrappedHitos.value).pipe(
          map((updatedHitos) => {
            const index = this.hitos$.value.findIndex((currenthitos) => currenthitos === wrappedHitos);
            this.hitos$.value[index] = new StatusWrapper<IConvocatoriaHito>(updatedHitos);
          }),
          tap(() => this.logger.debug(ConvocatoriaHitosFragment.name,
            `${this.updateHitos.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ConvocatoriaHitosFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched: boolean = this.hitos$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ConvocatoriaHitosFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.hitosEliminados.length > 0 || touched);
  }

}
