import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONVOCATORIA_CONCEPTO_GASTO_CODIGO_EC_CONVERTER } from '@core/converters/csp/convocatoria-concepto-gasto-codigo-ec.converter';
import { IConvocatoriaConceptoGastoCodigoEcBackend } from '@core/models/csp/backend/convocatoria-concepto-gasto-codigo-ec-backend';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { environment } from '@env';
import { SgiMutableRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaConceptoGastoCodigoEcService extends
  SgiMutableRestService<number, IConvocatoriaConceptoGastoCodigoEcBackend, IConvocatoriaConceptoGastoCodigoEc> {
  private static readonly MAPPING = '/convocatoriaconceptogastocodigoecs';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaConceptoGastoCodigoEcService.name,
      `${environment.serviceServers.csp}${ConvocatoriaConceptoGastoCodigoEcService.MAPPING}`,
      http,
      CONVOCATORIA_CONCEPTO_GASTO_CODIGO_EC_CONVERTER
    );
  }

  /**
   * Actualiza el listado de IDConvocatoriaConceptoGasto asociados a un IConvocatoriaConceptoGastoCodigoEc
   *
   * @param id Id del IConvocatoriaConceptoGasto
   * @param entities Listado de IConvocatoriaConceptoGastoCodigoEc
   */
  updateList(id: number, entities: IConvocatoriaConceptoGastoCodigoEc[]): Observable<IConvocatoriaConceptoGastoCodigoEc[]> {
    return this.http.patch<IConvocatoriaConceptoGastoCodigoEcBackend[]>(
      `${this.endpointUrl}/${id}`,
      this.converter.fromTargetArray(entities)
    ).pipe(
      map((response => this.converter.toTargetArray(response)))
    );
  }

}
