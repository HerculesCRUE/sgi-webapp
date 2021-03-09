import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { environment } from '@env';
import { SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaConceptoGastoService extends SgiRestService<number, IConvocatoriaConceptoGasto> {
  private static readonly MAPPING = '/convocatoriaconceptogastos';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaConceptoGastoService.name,
      `${environment.serviceServers.csp}${ConvocatoriaConceptoGastoService.MAPPING}`,
      http
    );
  }

  /**
 * Recupera listado de convocatoria concepto gastos códigos económicos permitidos.
 * @param id convocatoriaConceptoGasto
 * @param options opciones de búsqueda.
 */
  findAllConvocatoriaConceptoGastoCodigoEcs(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGastoCodigoEc>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastocodigoec`;
    return this.find<IConvocatoriaConceptoGastoCodigoEc, IConvocatoriaConceptoGastoCodigoEc>(endpointUrl);
  }

  /**
 * Comprueba si existe códigos económicos asociados a la convocatoria concepto de gasto
 *
 * @param id Id de la convocatoria concepto de gasto
 * @retrurn true/false
 */
  existsCodigosEconomicos(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/convocatoriagastocodigoec`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

}