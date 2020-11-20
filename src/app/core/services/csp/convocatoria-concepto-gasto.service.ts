import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaConceptoGastoService extends SgiRestService<number, IConvocatoriaConceptoGasto> {
  private static readonly MAPPING = '/convocatoriaconceptogastos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaConceptoGastoService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaConceptoGastoService.MAPPING}`,
      http
    );
  }

}