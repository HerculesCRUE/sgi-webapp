import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaEntidadConvocanteService extends SgiRestService<number, IConvocatoriaEntidadConvocante> {
  private static readonly MAPPING = '/convocatoriaentidadconvocantes';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaEntidadConvocanteService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaEntidadConvocanteService.MAPPING}`,
      http
    );
  }
}
