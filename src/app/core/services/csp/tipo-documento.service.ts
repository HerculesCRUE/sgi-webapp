import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITipoDocumento } from '@core/models/csp/tipos-configuracion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService extends SgiRestService<number, ITipoDocumento> {
  private static readonly MAPPING = '/tipodocumentos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoDocumentoService.name,
      logger,
      `${environment.serviceServers.csp}${TipoDocumentoService.MAPPING}`,
      http
    );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<ITipoDocumento>> {
    this.logger.debug(TipoDocumentoService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<ITipoDocumento, ITipoDocumento>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(TipoDocumentoService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

}
