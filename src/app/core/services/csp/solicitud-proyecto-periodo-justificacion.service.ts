import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISolicitudProyectoPeriodoJustificacion } from '@core/models/csp/solicitud-proyecto-periodo-justificacion';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudProyectoPeriodoJustificacionService extends SgiRestService<number, ISolicitudProyectoPeriodoJustificacion> {
  private static readonly MAPPING = '/solicitudproyectoperiodojustificaciones';

  constructor(protected http: HttpClient) {
    super(
      SolicitudProyectoPeriodoJustificacionService.name,
      `${environment.serviceServers.csp}${SolicitudProyectoPeriodoJustificacionService.MAPPING}`,
      http
    );
  }

  updateList(proyectoSolictudSocioId: number, entities: ISolicitudProyectoPeriodoJustificacion[]):
    Observable<ISolicitudProyectoPeriodoJustificacion[]> {
    return this.http.patch<ISolicitudProyectoPeriodoJustificacion[]>(
      `${this.endpointUrl}/${proyectoSolictudSocioId}`, entities);
  }
}
