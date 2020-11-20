import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITipoOrigenFuenteFinanciacion } from '@core/models/csp/tipo-origen-fuente-financiacion';
import { environment } from '@env';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoOrigenFuenteFinanciacionService extends SgiRestService<number, ITipoOrigenFuenteFinanciacion> {
  private static readonly MAPPING = '/tipoorigenfuentefinanciaciones';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoOrigenFuenteFinanciacionService.name,
      logger,
      `${environment.serviceServers.csp}${TipoOrigenFuenteFinanciacionService.MAPPING}`,
      http
    );
  }

  /**
   * Muestra activos y no activos
   *
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<ITipoOrigenFuenteFinanciacion>> {
    this.logger.debug(TipoOrigenFuenteFinanciacionService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<ITipoOrigenFuenteFinanciacion, ITipoOrigenFuenteFinanciacion>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(TipoOrigenFuenteFinanciacionService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }
}
