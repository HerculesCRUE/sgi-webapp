import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITipoHito } from '@core/models/csp/tipos-configuracion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoHitoService extends SgiRestService<number, ITipoHito> {
  private static readonly MAPPING = '/tipohitos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoHitoService.name,
      logger,
      `${environment.serviceServers.csp}${TipoHitoService.MAPPING}`,
      http
    );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<ITipoHito>> {
    this.logger.debug(TipoHitoService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<ITipoHito, ITipoHito>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(TipoHitoService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }


}

