import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { SgiRestService, SgiRestListResult } from '@sgi/framework/http';
import { environment } from '@env';
import { IDictamen } from '@core/models/eti/dictamen';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DictamenService extends SgiRestService<number, IDictamen> {
  private static readonly MAPPING = '/dictamenes';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      DictamenService.name,
      logger,
      `${environment.serviceServers.eti}${DictamenService.MAPPING}`,
      http
    );
  }

  /**
   * Devuelve los dictamenes para los que el TipoEvaluación sea Memoria
   * y el TipoEstadoMemoria sea En secretaría revisión mínima
   *
   */
  findAllByMemoriaRevisionMinima(): Observable<SgiRestListResult<IDictamen>> {
    this.logger.debug(DictamenService.name, `findAllByMemoriaRevisionMinima()`, '-', 'start');
    return this.find<IDictamen, IDictamen>(`${this.endpointUrl}/memoria-revision-minima`, null).pipe(
      tap(() => this.logger.debug(DictamenService.name, `findAllByMemoriaRevisionMinima()`, '-', 'end'))
    );
  }

  /**
   * Devuelve los dictamenes para los que el TipoEvaluación sea Memoria
   * y el TipoEstadoMemoria NO esté En secretaría revisión mínima
   *
   */
  findAllByMemoriaNoRevisionMinima(): Observable<SgiRestListResult<IDictamen>> {
    this.logger.debug(DictamenService.name, `findAllByMemoriaNoRevisionMinima()`, '-', 'start');
    return this.find<IDictamen, IDictamen>(`${this.endpointUrl}/memoria-no-revision-minima`, null).pipe(
      tap(() => this.logger.debug(DictamenService.name, `findAllByMemoriaNoRevisionMinima()`, '-', 'end'))
    );
  }

  /**
   * Devuelve los dictamenes para los que el TipoEvaluación sea Retrospectiva
   */

  findAllByRetrospectiva(): Observable<SgiRestListResult<IDictamen>> {
    this.logger.debug(DictamenService.name, `findAllByRetrospectiva()`, '-', 'start');
    return this.find<IDictamen, IDictamen>(`${this.endpointUrl}/retrospectiva`, null).pipe(
      tap(() => this.logger.debug(DictamenService.name, `findAllByRetrospectiva()`, '-', 'end'))
    );
  }
}
