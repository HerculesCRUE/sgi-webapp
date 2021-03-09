import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaConceptoGastoCodigoEcService extends SgiRestService<number, IConvocatoriaConceptoGastoCodigoEc> {
  private static readonly MAPPING = '/convocatoriaconceptogastocodigoecs';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaConceptoGastoCodigoEcService.name,
      `${environment.serviceServers.csp}${ConvocatoriaConceptoGastoCodigoEcService.MAPPING}`,
      http
    );
  }

  /**
 * Actualiza el listado de IDConvocatoriaConceptoGasto asociados a un IConvocatoriaConceptoGastoCodigoEc
 *
 * @param id Id del IConvocatoriaConceptoGasto
 * @param entities Listado de IConvocatoriaConceptoGastoCodigoEc
 */
  updateList(id: number, entities: IConvocatoriaConceptoGastoCodigoEc[]): Observable<IConvocatoriaConceptoGastoCodigoEc[]> {
    return this.http.patch<IConvocatoriaConceptoGastoCodigoEc[]>(`${this.endpointUrl}/${id}`, entities);
  }

}