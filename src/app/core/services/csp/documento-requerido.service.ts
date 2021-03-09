import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDocumentoRequerido } from '@core/models/csp/documentos-requeridos-solicitud';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class DocumentoRequeridoService extends SgiRestService<number, IDocumentoRequerido> {
  private static readonly MAPPING = '/documentorequiridosolicitudes';

  constructor(protected http: HttpClient) {
    super(
      DocumentoRequeridoService.name,
      `${environment.serviceServers.csp}${DocumentoRequeridoService.MAPPING}`,
      http
    );
  }
}
