import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SolicitudProyectoDatosService extends SgiRestService<number, ISolicitudProyectoDatos> {
  private static readonly MAPPING = '/solicitudproyectodatos';

  constructor(protected http: HttpClient) {
    super(
      SolicitudProyectoDatosService.name,
      `${environment.serviceServers.csp}${SolicitudProyectoDatosService.MAPPING}`,
      http
    );
  }

  /**
   * Comprueba si SolicitudProyectoDatos tiene SolicitudProyectoPresupuesto
   * relacionado
   *
   * @param id solicitudProyectoDatos
   */
  hasSolicitudPresupuesto(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/solicitudpresupuesto`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Comprueba si SolicitudProyectoDatos tiene SolicitudProyectoSocio
   * relacionado
   *
   * @param id solicitudProyectoDatos
   */
  hasSolicitudSocio(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/solicitudsocio`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Comprueba si SolicitudProyectoDatos tiene SolicitudEntidadFinanciadora
   * relacionado
   *
   * @param id solicitudProyectoDatos
   */
  hasSolicitudEntidadFinanciadora(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/solicitudentidadfinanciadora`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

}
