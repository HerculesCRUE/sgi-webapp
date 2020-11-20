import { Injectable } from '@angular/core';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { NGXLogger } from 'ngx-logger';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class UnidadGestionService extends SgiRestService<number, IUnidadGestion> {

  private static readonly MAPPING = '/unidades';


  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      UnidadGestionService.name,
      logger,
      `${environment.serviceServers.usr}${UnidadGestionService.MAPPING}`,
      http
    );
  }


  /**
   * Recupera las unidades de gestión restringidas por los permisos del usuario logueado.
   * @param options opciones de búsqueda.
   */
  findAllRestringidos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IUnidadGestion>> {
    this.logger.debug(UnidadGestionService.name, `findAllRestringidos(${options ? JSON.stringify(options) : options})`, '-', 'START');
    return this.find<IUnidadGestion, IUnidadGestion>(`${this.endpointUrl}/restringidos`, options).pipe(
      tap(() => this.logger.debug(UnidadGestionService.name, `findAllRestringidos(${options ? JSON.stringify(options) : options})`, '-', 'END'))
    );
  }

  /**
   * Recupera una unidad de gestión por el acrónimo recibido.
   * @param unidadGestionRef acrónimo de la unidad de gestión.
   * @returns unidad de gestión.
   */
  findByAcronimo(unidadGestionRef: string): Observable<IUnidadGestion> {
    this.logger.debug(this.serviceName, `findByAcronimo(${unidadGestionRef})`, '-', 'START');
    return this.http.get<IUnidadGestion>(`${this.endpointUrl}/acronimo/${unidadGestionRef}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(this.serviceName, `findByAcronimo(${unidadGestionRef}):`, error);
        return throwError(error);
      }),
      map(response => {
        this.logger.debug(this.serviceName, `findByAcronimo(${unidadGestionRef})`, '-', 'END');
        return this.converter.toTarget(response);
      })
    );

  }
}
