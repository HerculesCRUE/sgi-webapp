import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaEntidadGestoraService extends SgiRestService<number, IConvocatoriaEntidadGestora> {
  private static readonly MAPPING = '/convocatoriaentidadgestoras';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaEntidadGestoraService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaEntidadGestoraService.MAPPING}`,
      http
    );
  }
}
