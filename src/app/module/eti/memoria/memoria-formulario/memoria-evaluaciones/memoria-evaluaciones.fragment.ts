import { Fragment } from '@core/services/action-service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { map } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { MemoriaService } from '@core/services/eti/memoria.service';

export class MemoriaEvaluacionesFragment extends Fragment {

  evaluaciones$: BehaviorSubject<StatusWrapper<IEvaluacion>[]> = new BehaviorSubject<StatusWrapper<IEvaluacion>[]>([]);

  constructor(
    private logger: NGXLogger,
    key: number,
    private service: MemoriaService) {
    super(key);
  }

  protected onInitialize(): void {
    this.logger.debug(MemoriaEvaluacionesFragment.name, 'onInitialize()', 'start');

    if (this.getKey()) {
      this.service.getEvaluacionesMemoria(this.getKey() as number).pipe(
        map((response) => {
          if (response.items) {
            return response.items;
          }
          else {
            return [];
          }
        })
      ).subscribe((evaluaciones) => {
        this.evaluaciones$.next(evaluaciones.map(evaluacion => new StatusWrapper<IEvaluacion>(evaluacion)));
      });
    }
  }

  saveOrUpdate(): Observable<string | number | void> {
    return of(void 0);
  }
}
