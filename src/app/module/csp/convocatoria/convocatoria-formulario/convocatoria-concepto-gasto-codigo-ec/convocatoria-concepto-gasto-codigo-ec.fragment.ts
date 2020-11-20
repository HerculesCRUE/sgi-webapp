import { Fragment } from '@core/services/action-service';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { tap, map, takeLast, mergeMap } from 'rxjs/operators';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { ConvocatoriaConceptoGastoCodigoEcService } from '@core/services/csp/convocatoria-concepto-gasto-codigo-ec.service';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { ConvocatoriaConceptoGastoFragment } from '../convocatoria-concepto-gasto/convocatoria-concepto-gasto.fragment';

export class ConvocatoriaConceptoGastoCodigoEcFragment extends Fragment {
  convocatoriaConceptoGastoCodigoEcPermitido$ = new BehaviorSubject<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>[]>([]);
  convocatoriaConceptoGastoCodigoEcNoPermitido$ = new BehaviorSubject<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>[]>([]);
  convocatoriaConceptoGastoCodigoEcEliminados: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private readonly convocatoriaService: ConvocatoriaService,
    private readonly convocatoriaConceptoGastoCodigoEcService: ConvocatoriaConceptoGastoCodigoEcService,
    private readonly elegibilidadFragment: ConvocatoriaConceptoGastoFragment
  ) {
    super(key);
    this.setComplete(true);
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, 'constructor()', 'start');
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, 'onInitialize()', 'start');
    this.elegibilidadFragment.initialize();
    if (this.getKey()) {
      this.convocatoriaService.getConvocatoriaConceptoGastoCodigoEcsPermitidos(this.getKey() as number).pipe(
        map((response) => {
          if (response.items) {
            return response.items;
          }
          else {
            return [];
          }
        })
      ).subscribe((convocatoriaConceptoGastoCodigoEc) => {

        convocatoriaConceptoGastoCodigoEc.map(conv => {
          conv.convocatoriaConceptoGasto = this.elegibilidadFragment.convocatoriaConceptoGastoPermitido$.value.filter(
            permitidos => permitidos.value.conceptoGasto.id === conv.convocatoriaConceptoGasto.conceptoGasto.id)[0].value;
        });

        this.convocatoriaConceptoGastoCodigoEcPermitido$.next(convocatoriaConceptoGastoCodigoEc.map(
          convocatoriaConceptoGastoCodigoEcs => new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(convocatoriaConceptoGastoCodigoEcs))
        );
      });

      this.convocatoriaService.getConvocatoriaConceptoGastoCodigoEcsNoPermitidos(this.getKey() as number).pipe(
        map((response) => {
          if (response.items) {
            return response.items;
          }
          else {
            return [];
          }
        })
      ).subscribe((convocatoriaConceptoGastoCodigoEc) => {

        convocatoriaConceptoGastoCodigoEc.map(conv => {
          conv.convocatoriaConceptoGasto = this.elegibilidadFragment.convocatoriaConceptoGastoNoPermitido$.value.filter(
            noPermitidos => noPermitidos.value.conceptoGasto.id === conv.convocatoriaConceptoGasto.conceptoGasto.id)[0].value;
        });

        this.convocatoriaConceptoGastoCodigoEcNoPermitido$.next(convocatoriaConceptoGastoCodigoEc.map(
          convocatoriaConceptoGastoCodigoEcs => new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(convocatoriaConceptoGastoCodigoEcs))
        );
        this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, 'onInitialize()', 'end');
      });
    }
  }

  public addConvocatoriaConceptoGastoCodigoEc(convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc) {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name,
      `${this.addConvocatoriaConceptoGastoCodigoEc.name}(addConvocatoriaConceptoGastoCodigoEc: ${convocatoriaConceptoGastoCodigoEc})`, 'start');
    const wrapped = new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(convocatoriaConceptoGastoCodigoEc);
    wrapped.setCreated();
    const permitido = wrapped.value.convocatoriaConceptoGasto.permitido;
    if (permitido) {
      const current = this.convocatoriaConceptoGastoCodigoEcPermitido$.value;
      current.push(wrapped);
      this.convocatoriaConceptoGastoCodigoEcPermitido$.next(current);
    } else {
      const current = this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value;
      current.push(wrapped);
      this.convocatoriaConceptoGastoCodigoEcNoPermitido$.next(current);
    }
    this.setChanges(true);
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name,
      `${this.addConvocatoriaConceptoGastoCodigoEc.name}
      (addConvocatoriaConceptoGastoCodigoEc: ${convocatoriaConceptoGastoCodigoEc})`, 'end');
  }

  public deleteConvocatoriaConceptoGastoCodigoEc(wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>, noEliminar?: boolean) {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name,
      `${this.deleteConvocatoriaConceptoGastoCodigoEc.name}(wrapper: ${wrapper})`, 'start');
    const permitido = wrapper.value.convocatoriaConceptoGasto.permitido;
    if (permitido) {
      const current = this.convocatoriaConceptoGastoCodigoEcPermitido$.value;
      const index = current.findIndex(
        (value: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>) => value === wrapper
      );
      if (index >= 0) {
        if (!wrapper.created && !noEliminar) {
          this.convocatoriaConceptoGastoCodigoEcEliminados.push(current[index]);
        }
        current.splice(index, 1);
        this.convocatoriaConceptoGastoCodigoEcPermitido$.next(current);
        this.setChanges(true);
      }
    } else {
      const current = this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value;
      const index = current.findIndex(
        (value: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>) => value === wrapper
      );
      if (index >= 0) {
        if (!wrapper.created && !noEliminar) {
          this.convocatoriaConceptoGastoCodigoEcEliminados.push(current[index]);
        }
        current.splice(index, 1);
        this.convocatoriaConceptoGastoCodigoEcNoPermitido$.next(current);
        this.setChanges(true);
      }
    }

    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name,
      `${this.deleteConvocatoriaConceptoGastoCodigoEc.name}(wrapper: ${wrapper})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteConvocatoriaConceptoGastoCodigoEcs(),
      this.updateConvocatoriaConceptoGastoCodigoEcs(),
      this.createConvocatoriaConceptoGastoCodigoEcs()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private deleteConvocatoriaConceptoGastoCodigoEcs(): Observable<void> {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.deleteConvocatoriaConceptoGastoCodigoEcs.name}()`, 'start');
    if (this.convocatoriaConceptoGastoCodigoEcEliminados.length === 0) {
      this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.deleteConvocatoriaConceptoGastoCodigoEcs.name}()`, 'end');
      return of(void 0);
    }
    return from(this.convocatoriaConceptoGastoCodigoEcEliminados).pipe(
      mergeMap((wrapped) => {
        return this.convocatoriaConceptoGastoCodigoEcService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.convocatoriaConceptoGastoCodigoEcEliminados = this.convocatoriaConceptoGastoCodigoEcEliminados.filter(
                deletedConvocatoriaConceptoGastoCodigoEc => deletedConvocatoriaConceptoGastoCodigoEc.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name,
              `${this.deleteConvocatoriaConceptoGastoCodigoEcs.name}()`, 'end'))
          );
      }));
  }

  private createConvocatoriaConceptoGastoCodigoEcs(): Observable<void> {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.createConvocatoriaConceptoGastoCodigoEcs.name}()`, 'start');
    const createdConvocatoriaConceptoGastoCodigoEcs =
      this.convocatoriaConceptoGastoCodigoEcPermitido$.value.filter(
        (convocatoriaConceptoGastoCodigoEcPermitido) => convocatoriaConceptoGastoCodigoEcPermitido.created).concat(
          this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value.filter(
            (convocatoriaConceptoGastoCodigoEcNoPermitido) => convocatoriaConceptoGastoCodigoEcNoPermitido.created)
        );
    if (createdConvocatoriaConceptoGastoCodigoEcs.length === 0) {
      this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.createConvocatoriaConceptoGastoCodigoEcs.name}()`, 'end');
      return of(void 0);
    }
    createdConvocatoriaConceptoGastoCodigoEcs.forEach(
      (wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>) => wrapper.value.convocatoriaConceptoGasto.convocatoria = {
        id: this.getKey(),
        activo: true
      } as IConvocatoria
    );
    return from(createdConvocatoriaConceptoGastoCodigoEcs).pipe(
      mergeMap((wrappedConvocatoriaConceptoGastoCodigoEcs) => {
        if (wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto.id === null
          && wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto.permitido) {
          wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto =
            this.elegibilidadFragment.convocatoriaConceptoGastoPermitido$.value.map(wrapp => wrapp.value).find(
              convocatoriaConceptoGasto =>
                convocatoriaConceptoGasto.conceptoGasto.id ===
                wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto.conceptoGasto.id);
        }

        if (wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto.id === null
          && !wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto.permitido) {
          wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto =
            this.elegibilidadFragment.convocatoriaConceptoGastoNoPermitido$.value.map(wrapp => wrapp.value).find(
              convocatoriaConceptoGasto =>
                convocatoriaConceptoGasto.conceptoGasto.id ===
                wrappedConvocatoriaConceptoGastoCodigoEcs.value.convocatoriaConceptoGasto.conceptoGasto.id);
        }

        return this.convocatoriaConceptoGastoCodigoEcService.create(wrappedConvocatoriaConceptoGastoCodigoEcs.value).pipe(
          map((updatedConvocatoriaConceptoGastoCodigoEcs) => {
            const indexPermitido = this.convocatoriaConceptoGastoCodigoEcPermitido$.value.findIndex(
              (currentConvocatoriaConceptoGastoCodigoEcs) =>
                currentConvocatoriaConceptoGastoCodigoEcs === wrappedConvocatoriaConceptoGastoCodigoEcs);
            this.convocatoriaConceptoGastoCodigoEcPermitido$.value[indexPermitido] =
              new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(updatedConvocatoriaConceptoGastoCodigoEcs);

            const indexNoPermitido = this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value.findIndex(
              (currentConvocatoriaConceptoGastoCodigoEcs) =>
                currentConvocatoriaConceptoGastoCodigoEcs === wrappedConvocatoriaConceptoGastoCodigoEcs);
            this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value[indexNoPermitido] =
              new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(updatedConvocatoriaConceptoGastoCodigoEcs);
          }),
          tap(() => this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name,
            `${this.createConvocatoriaConceptoGastoCodigoEcs.name}()`, 'end'))
        );
      }));
  }

  private updateConvocatoriaConceptoGastoCodigoEcs(): Observable<void> {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.updateConvocatoriaConceptoGastoCodigoEcs.name}()`, 'start');
    const updateConvocatoriaConceptoGastoCodigoEcs = this.convocatoriaConceptoGastoCodigoEcPermitido$.value.filter(
      (convocatoriaConceptoGastoCodigoEcPermitido) => convocatoriaConceptoGastoCodigoEcPermitido.edited).concat(
        this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value.filter(
          (convocatoriaConceptoGastoCodigoEcNoPermitido) => convocatoriaConceptoGastoCodigoEcNoPermitido.edited));
    if (updateConvocatoriaConceptoGastoCodigoEcs.length === 0) {
      this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.updateConvocatoriaConceptoGastoCodigoEcs.name}()`, 'end');
      return of(void 0);
    }
    return from(updateConvocatoriaConceptoGastoCodigoEcs).pipe(
      mergeMap((wrappedConvocatoriaConceptoGastoCodigoEcs) => {
        return this.convocatoriaConceptoGastoCodigoEcService.update(
          wrappedConvocatoriaConceptoGastoCodigoEcs.value.id, wrappedConvocatoriaConceptoGastoCodigoEcs.value).pipe(
            map((updatedConvocatoriaConceptoGastoCodigoEcs) => {
              const indexPermitido = this.convocatoriaConceptoGastoCodigoEcPermitido$.value.findIndex(
                (currentConvocatoriaConceptoGastoCodigoEcs) =>
                  currentConvocatoriaConceptoGastoCodigoEcs === wrappedConvocatoriaConceptoGastoCodigoEcs);
              this.convocatoriaConceptoGastoCodigoEcPermitido$.value[indexPermitido] =
                new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(updatedConvocatoriaConceptoGastoCodigoEcs);

              const indexNoPermitido = this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value.findIndex(
                (currentConvocatoriaConceptoGastoCodigoEcs) =>
                  currentConvocatoriaConceptoGastoCodigoEcs === wrappedConvocatoriaConceptoGastoCodigoEcs);
              this.convocatoriaConceptoGastoCodigoEcNoPermitido$.value[indexNoPermitido] =
                new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(updatedConvocatoriaConceptoGastoCodigoEcs);
            }),
            tap(() => this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name,
              `${this.updateConvocatoriaConceptoGastoCodigoEcs.name}()`, 'end'))
          );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    const touched: boolean = this.convocatoriaConceptoGastoCodigoEcPermitido$.value.some((wrapper) => wrapper.touched);
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return (this.convocatoriaConceptoGastoCodigoEcEliminados.length > 0 || touched);
  }

}
