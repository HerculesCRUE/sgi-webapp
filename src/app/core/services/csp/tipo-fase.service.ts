import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoFaseService extends SgiRestService<number, ITipoFase> {
  private static readonly MAPPING = '/tipofases';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoFaseService.name,
      logger,
      `${environment.serviceServers.csp}${TipoFaseService.MAPPING}`,
      http
    );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<ITipoFase>> {
    this.logger.debug(TipoFaseService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<ITipoFase, ITipoFase>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(TipoFaseService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

}
