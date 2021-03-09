import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaDocumento } from '@core/models/csp/convocatoria-documento';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaDocumentoService extends SgiRestService<number, IConvocatoriaDocumento> {
  private static readonly MAPPING = '/convocatoriadocumentos';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaDocumentoService.name,
      `${environment.serviceServers.csp}${ConvocatoriaDocumentoService.MAPPING}`,
      http
    );
  }

}
