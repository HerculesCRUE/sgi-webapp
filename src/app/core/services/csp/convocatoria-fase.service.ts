import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaFaseService extends SgiRestService<number, IConvocatoriaFase> {
  private static readonly MAPPING = '/convocatoriafases';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaFaseService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaFaseService.MAPPING}`,
      http
    );
  }
}
