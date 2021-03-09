import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISolicitudDocumento } from '@core/models/csp/solicitud-documento';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class SolicitudDocumentoService extends SgiRestService<number, ISolicitudDocumento> {
  private static readonly MAPPING = '/solicituddocumentos';

  constructor(protected http: HttpClient) {
    super(
      SolicitudDocumentoService.name,
      `${environment.serviceServers.csp}${SolicitudDocumentoService.MAPPING}`,
      http
    );
  }
}
