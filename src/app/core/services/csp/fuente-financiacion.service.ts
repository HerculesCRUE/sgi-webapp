import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { environment } from '@env';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FuenteFinanciacionService extends SgiRestService<number, IFuenteFinanciacion> {
  private static readonly MAPPING = '/fuentefinanciaciones';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      FuenteFinanciacionService.name,
      logger,
      `${environment.serviceServers.csp}${FuenteFinanciacionService.MAPPING}`,
      http
    );
  }

  /**
   * Muestra activos y no activos
   *
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IFuenteFinanciacion>> {
    this.logger.debug(FuenteFinanciacionService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<IFuenteFinanciacion, IFuenteFinanciacion>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(FuenteFinanciacionService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

  /**
   * Reactivar fuentes de financiación
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    this.logger.debug(FuenteFinanciacionService.name, `${this.reactivar.name}(${id}`, '-', 'start');
    return this.http.patch(`${this.endpointUrl}/${id}/reactivar`, { id }).pipe(
      map(() => this.logger.debug(FuenteFinanciacionService.name, `${this.reactivar.name}(${id}`, '-', 'end'))
    );
  }

  /**
   * Desactivar fuentes de financiación
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    this.logger.debug(FuenteFinanciacionService.name, `${this.desactivar.name}(${id}`, '-', 'start');
    return this.http.patch(`${this.endpointUrl}/${id}/desactivar`, { id }).pipe(
      map(() => this.logger.debug(FuenteFinanciacionService.name, `${this.desactivar.name}(${id}`, '-', 'end'))
    );
  }

}
