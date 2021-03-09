import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoPeriodoSeguimientoDocumento } from '@core/models/csp/proyecto-periodo-seguimiento-documento';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ProyectoPeriodoSeguimientoDocumentoService extends SgiRestService<number, IProyectoPeriodoSeguimientoDocumento> {
  private static readonly MAPPING = '/proyectoperiodoseguimientodocumentos';

  constructor(protected http: HttpClient) {
    super(
      ProyectoPeriodoSeguimientoDocumentoService.name,
      `${environment.serviceServers.csp}${ProyectoPeriodoSeguimientoDocumentoService.MAPPING}`,
      http
    );
  }

}
