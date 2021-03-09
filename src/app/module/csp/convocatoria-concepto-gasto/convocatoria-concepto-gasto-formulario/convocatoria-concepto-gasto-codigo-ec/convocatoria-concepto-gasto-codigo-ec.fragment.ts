import { Fragment } from '@core/services/action-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { tap, map } from 'rxjs/operators';
import { ConvocatoriaConceptoGastoService } from '@core/services/csp/convocatoria-concepto-gasto.service';
import { ConvocatoriaConceptoGastoCodigoEcService } from '@core/services/csp/convocatoria-concepto-gasto-codigo-ec.service';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';

export class ConvocatoriaConceptoGastoCodigoEcFragment extends Fragment {
  convocatoriaConceptoGastoCodigoEcs$ = new BehaviorSubject<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>[]>([]);

  constructor(
    key: number,
    private convocatoriaConceptoGastoService: ConvocatoriaConceptoGastoService,
    private convocatoriaConceptoGastoCodigoEcService: ConvocatoriaConceptoGastoCodigoEcService,
    public convocatoriaConceptoGasto: IConvocatoriaConceptoGasto,
    public readonly: boolean
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    if (this.getKey()) {
      const id = this.getKey() as number;
      this.subscriptions.push(
        this.convocatoriaConceptoGastoService.findAllConvocatoriaConceptoGastoCodigoEcs(id).pipe(
          map(response => response.items)
        ).subscribe(
          result => {
            this.convocatoriaConceptoGastoCodigoEcs$.next(
              result.map(convocatoriaConceptoGastoCodigoEc =>
                new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(convocatoriaConceptoGastoCodigoEc)
              )
            );
          }
        )
      );
    }
  }

  addConvocatoriaConceptoGastoCodigoEc(element: IConvocatoriaConceptoGastoCodigoEc) {
    const wrapped = new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(element);
    wrapped.setCreated();
    const current = this.convocatoriaConceptoGastoCodigoEcs$.value;
    current.push(wrapped);
    this.convocatoriaConceptoGastoCodigoEcs$.next(current);
    this.setChanges(true);
  }

  deleteConvocatoriaConceptoGastoCodigoEc(wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>) {
    const current = this.convocatoriaConceptoGastoCodigoEcs$.value;
    const index = current.findIndex((value) => value === wrapper);
    if (index >= 0) {
      current.splice(index, 1);
      this.convocatoriaConceptoGastoCodigoEcs$.next(current);
      this.setChanges(true);
    }
  }

  saveOrUpdate(): Observable<void> {
    const values = this.convocatoriaConceptoGastoCodigoEcs$.value.map(wrapper => wrapper.value);
    const id = this.getKey() as number;
    return this.convocatoriaConceptoGastoCodigoEcService.updateList(id, values)
      .pipe(
        map((results) => {
          this.convocatoriaConceptoGastoCodigoEcs$.next(
            results.map(value => new StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>(value)));
        }),
        tap(() => {
          if (this.isSaveOrUpdateComplete()) {
            this.setChanges(false);
          }
        })
      );
  }

  private isSaveOrUpdateComplete(): boolean {
    const hasTouched = this.convocatoriaConceptoGastoCodigoEcs$.value.some((wrapper) => wrapper.touched);
    return !hasTouched;
  }
}
