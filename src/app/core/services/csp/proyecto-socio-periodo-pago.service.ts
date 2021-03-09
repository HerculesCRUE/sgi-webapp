import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoSocioPeriodoPago } from '@core/models/csp/proyecto-socio-periodo-pago';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectoSocioPeriodoPagoService extends SgiRestService<number, IProyectoSocioPeriodoPago> {
  private static readonly MAPPING = '/proyectosocioperiodopagos';

  constructor(protected http: HttpClient) {
    super(
      ProyectoSocioPeriodoPagoService.name,
      `${environment.serviceServers.csp}${ProyectoSocioPeriodoPagoService.MAPPING}`,
      http
    );
  }

  updateList(proyectoSocioId: number, entities: IProyectoSocioPeriodoPago[]):
    Observable<IProyectoSocioPeriodoPago[]> {
    return this.http.patch<IProyectoSocioPeriodoPago[]>(
      `${this.endpointUrl}/${proyectoSocioId}`, entities);
  }

}
