import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaDocumento } from '@core/models/csp/convocatoria-documento';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaDocumentoService extends SgiRestService<number, IConvocatoriaDocumento> {
  private static readonly MAPPING = '/convocatoriadocumentos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaDocumentoService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaDocumentoService.MAPPING}`,
      http
    );
  }

}