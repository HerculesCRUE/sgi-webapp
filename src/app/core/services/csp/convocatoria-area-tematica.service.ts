import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaAreaTematicaService extends SgiRestService<number, IConvocatoriaAreaTematica> {
  private static readonly MAPPING = '/convocatoriaareatematicas';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaAreaTematicaService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaAreaTematicaService.MAPPING}`,
      http
    );
  }
}
