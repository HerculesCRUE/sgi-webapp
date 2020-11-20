import { Fragment } from '@core/services/action-service';
import { BehaviorSubject, Observable, of, from, merge } from 'rxjs';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { tap, map, mergeMap, takeLast } from 'rxjs/operators';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { ConvocatoriaFaseService } from '@core/services/csp/convocatoria-fase.service';


export class ConvocatoriaPlazosFasesFragment extends Fragment {
  plazosFase$: BehaviorSubject<StatusWrapper<IConvocatoriaFase>[]>;
  private fasesEliminadas: StatusWrapper<IConvocatoriaFase>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private readonly convocatoriaService: ConvocatoriaService,
    private readonly convocatoriaFaseService: ConvocatoriaFaseService
  ) {
    super(key);
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.plazosFase$ = new BehaviorSubject<StatusWrapper<IConvocatoriaFase>[]>([]);
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, 'onInitialize()', 'start');
    if (this.getKey()) {
      this.convocatoriaService.findFasesConvocatoria(this.getKey() as number).pipe(
        map((response) => {
          if (response.items) {
            return response.items;
          }
          else {
            return [];
          }
        })
      ).subscribe((plazosFases) => {
        this.plazosFase$.next(plazosFases.map(
          plazosFase => new StatusWrapper<IConvocatoriaFase>(plazosFase))
        );
        this.logger.debug(ConvocatoriaPlazosFasesFragment.name, 'onInitialize()', 'end');
      });
    }
  }

  /**
   * Insertamos plazos fase
   *
   * @param plazoFase PlazoFase
   */
  public addPlazosFases(plazoFase: IConvocatoriaFase) {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name,
      `addPlazosFases(plazoFase: ${plazoFase})`, 'start');
    const wrapped = new StatusWrapper<IConvocatoriaFase>(plazoFase);
    wrapped.setCreated();
    const current = this.plazosFase$.value;
    current.push(wrapped);
    this.plazosFase$.next(current);
    this.setChanges(true);
    this.setErrors(false);
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name,
      `addPlazosFases(plazoFase: ${plazoFase})`, 'end');
  }

  public deleteFase(wrapper: StatusWrapper<IConvocatoriaFase>) {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name,
      `${this.deleteFase.name}(wrapper: ${wrapper})`, 'start');
    const current = this.plazosFase$.value;
    const index = current.findIndex(
      (value: StatusWrapper<IConvocatoriaFase>) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.fasesEliminadas.push(current[index]);
      }
      current.splice(index, 1);
      this.plazosFase$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name,
      `${this.deleteFase.name}(wrapper: ${wrapper})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, 'saveOrUpdate()', 'start');
    return merge(
      this.deleteFases(),
      this.updateFases(),
      this.createFases()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private deleteFases(): Observable<void> {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.deleteFases.name}()`, 'start');
    if (this.fasesEliminadas.length === 0) {
      this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.deleteFases.name}()`, 'end');
      return of(void 0);
    }
    return from(this.fasesEliminadas).pipe(
      mergeMap((wrapped) => {
        return this.convocatoriaFaseService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.fasesEliminadas = this.fasesEliminadas.filter(deletedFase =>
                deletedFase.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ConvocatoriaPlazosFasesFragment.name,
              `${this.deleteFase.name}()`, 'end'))
          );
      }));
  }

  private createFases(): Observable<void> {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.createFases.name}()`, 'start');
    const createdFases = this.plazosFase$.value.filter((convocatoriaFase) => convocatoriaFase.created);
    if (createdFases.length === 0) {
      this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.createFases.name}()`, 'end');
      return of(void 0);
    }
    createdFases.forEach(
      (wrapper: StatusWrapper<IConvocatoriaFase>) => wrapper.value.convocatoria = {
        id: this.getKey(),
        activo: true
      } as IConvocatoria
    );
    return from(createdFases).pipe(
      mergeMap((wrappedFases) => {
        return this.convocatoriaFaseService.create(wrappedFases.value).pipe(
          map((updatedFases) => {
            const index = this.plazosFase$.value.findIndex((currentFases) => currentFases === wrappedFases);
            this.plazosFase$.value[index] = new StatusWrapper<IConvocatoriaFase>(updatedFases);
          }),
          tap(() => this.logger.debug(ConvocatoriaPlazosFasesFragment.name,
            `${this.createFases.name}()`, 'end'))
        );
      }));
  }

  private updateFases(): Observable<void> {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.updateFases.name}()`, 'start');
    const updateFases = this.plazosFase$.value.filter((convocatoriaFase) => convocatoriaFase.edited);
    if (updateFases.length === 0) {
      this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.updateFases.name}()`, 'end');
      return of(void 0);
    }
    return from(updateFases).pipe(
      mergeMap((wrappedFases) => {
        return this.convocatoriaFaseService.update(wrappedFases.value.id, wrappedFases.value).pipe(
          map((updatedFases) => {
            const index = this.plazosFase$.value.findIndex((currentFases) => currentFases === wrappedFases);
            this.plazosFase$.value[index] = new StatusWrapper<IConvocatoriaFase>(updatedFases);
          }),
          tap(() => this.logger.debug(ConvocatoriaPlazosFasesFragment.name,
            `${this.updateFases.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched: boolean = this.plazosFase$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ConvocatoriaPlazosFasesFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.fasesEliminadas.length > 0 || touched);
  }
}
