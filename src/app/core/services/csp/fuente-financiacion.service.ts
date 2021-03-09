import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FuenteFinanciacionService extends SgiRestService<number, IFuenteFinanciacion> {
  private static readonly MAPPING = '/fuentefinanciaciones';

  constructor(protected http: HttpClient) {
    super(
      FuenteFinanciacionService.name,
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
    return this.find<IFuenteFinanciacion, IFuenteFinanciacion>(`${this.endpointUrl}/todos`, options);
  }

  /**
   * Reactivar fuentes de financiación
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, { id });
  }

  /**
   * Desactivar fuentes de financiación
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, { id });
  }

}
