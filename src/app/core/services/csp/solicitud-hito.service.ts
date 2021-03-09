import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISolicitudHito } from '@core/models/csp/solicitud-hito';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class SolicitudHitoService extends SgiRestService<number, ISolicitudHito> {
  static readonly MAPPING = '/solicitudhitos';

  constructor(protected http: HttpClient) {
    super(
      SolicitudHitoService.name,
      `${environment.serviceServers.csp}${SolicitudHitoService.MAPPING}`,
      http
    );
  }
}
