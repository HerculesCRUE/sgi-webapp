import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaEntidadFinanciadoraService extends SgiRestService<number, IConvocatoriaEntidadFinanciadora> {
  private static readonly MAPPING = '/convocatoriaentidadfinanciadoras';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaEntidadFinanciadoraService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaEntidadFinanciadoraService.MAPPING}`,
      http
    );
  }
}
