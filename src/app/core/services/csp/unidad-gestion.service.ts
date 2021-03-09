import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http/';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class UnidadGestionService extends SgiRestService<number, IUnidadGestion> {

  private static readonly MAPPING = '/unidades';


  constructor(private readonly logger: NGXLogger, protected http: HttpClient) {
    super(
      UnidadGestionService.name,
      `${environment.serviceServers.usr}${UnidadGestionService.MAPPING}`,
      http
    );
  }


  /**
   * Recupera las unidades de gestión restringidas por los permisos del usuario logueado.
   * @param options opciones de búsqueda.
   */
  findAllRestringidos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IUnidadGestion>> {
    return this.find<IUnidadGestion, IUnidadGestion>(`${this.endpointUrl}/restringidos`, options);
  }

  /**
   * Recupera una unidad de gestión por el acrónimo recibido.
   * @param unidadGestionRef acrónimo de la unidad de gestión.
   * @returns unidad de gestión.
   */
  findByAcronimo(unidadGestionRef: string): Observable<IUnidadGestion> {
    return this.http.get<IUnidadGestion>(`${this.endpointUrl}/acronimo/${unidadGestionRef}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      }),
      map(response => {
        return this.converter.toTarget(response);
      })
    );

  }
}
