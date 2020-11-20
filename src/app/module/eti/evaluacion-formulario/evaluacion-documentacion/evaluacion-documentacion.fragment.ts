import { Fragment } from '@core/services/action-service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export class EvaluacionDocumentacionFragment extends Fragment {

  constructor(
    private readonly logger: NGXLogger,
    key: number
  ) {
    super(key);
    this.logger.debug(EvaluacionDocumentacionFragment.name, 'constructor()', 'start');
    this.logger.debug(EvaluacionDocumentacionFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(EvaluacionDocumentacionFragment.name, 'onInitialize()', 'start');
    this.logger.debug(EvaluacionDocumentacionFragment.name, 'onInitialize()', 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(EvaluacionDocumentacionFragment.name, 'saveOrUpdate()', 'start');
    return of(void 0).pipe(
      tap(() => this.logger.debug(EvaluacionDocumentacionFragment.name, 'saveOrUpdate()', 'end'))
    );
  }

}
