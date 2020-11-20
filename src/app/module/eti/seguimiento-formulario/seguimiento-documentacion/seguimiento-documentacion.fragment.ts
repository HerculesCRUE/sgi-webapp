import { Fragment } from '@core/services/action-service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export class SeguimientoDocumentacionFragment extends Fragment {

  constructor(
    private readonly logger: NGXLogger,
    key: number
  ) {
    super(key);
    this.logger.debug(SeguimientoDocumentacionFragment.name, 'constructor()', 'start');
    this.logger.debug(SeguimientoDocumentacionFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(SeguimientoDocumentacionFragment.name, 'onInitialize()', 'start');
    this.logger.debug(SeguimientoDocumentacionFragment.name, 'onInitialize()', 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(SeguimientoDocumentacionFragment.name, 'saveOrUpdate()', 'start');
    return of(void 0).pipe(
      tap(() => this.logger.debug(SeguimientoDocumentacionFragment.name, 'saveOrUpdate()', 'end'))
    );
  }

}
