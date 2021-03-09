import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISolicitudProyectoPeriodoPago } from '@core/models/csp/solicitud-proyecto-periodo-pago';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudProyectoPeriodoPagoService extends SgiRestService<number, ISolicitudProyectoPeriodoPago> {
  private static readonly MAPPING = '/solicitudproyectoperiodopago';

  constructor(protected http: HttpClient) {
    super(
      SolicitudProyectoPeriodoPagoService.name,
      `${environment.serviceServers.csp}${SolicitudProyectoPeriodoPagoService.MAPPING}`,
      http
    );
  }

  updateList(proyectoSolictudSocioId: number, entities: ISolicitudProyectoPeriodoPago[]):
    Observable<ISolicitudProyectoPeriodoPago[]> {
    return this.http.patch<ISolicitudProyectoPeriodoPago[]>(
      `${this.endpointUrl}/${proyectoSolictudSocioId}`, entities);
  }
}
