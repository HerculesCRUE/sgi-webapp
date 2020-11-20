import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaHitoService extends SgiRestService<number, IConvocatoriaHito> {
  private static readonly MAPPING = '/convocatoriahitos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaHitoService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaHitoService.MAPPING}`,
      http
    );
  }

}