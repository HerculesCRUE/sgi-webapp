import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaConceptoGastoCodigoEcService extends SgiRestService<number, IConvocatoriaConceptoGastoCodigoEc> {
  private static readonly MAPPING = '/convocatoriaconceptogastocodigoecs';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaConceptoGastoCodigoEcService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaConceptoGastoCodigoEcService.MAPPING}`,
      http
    );
  }

}