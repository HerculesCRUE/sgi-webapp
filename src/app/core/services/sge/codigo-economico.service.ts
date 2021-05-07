import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CODIGO_ECONOMICO_CONVERTER } from '@core/converters/sge/codigo-economico.converter';
import { ICodigoEconomicoBackend } from '@core/models/sge/backend/codigo-economico-backend';
import { ICodigoEconomico } from '@core/models/sge/codigo-economico';
import { environment } from '@env';
import { SgiMutableRestService, SgiRestListResult } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodigoEconomicoService extends SgiMutableRestService<string, ICodigoEconomicoBackend, ICodigoEconomico>{
  private static readonly MAPPING = '/codigoeconomicos';

  constructor(protected http: HttpClient) {
    super(
      CodigoEconomicoService.name,
      `${environment.serviceServers.sge}${CodigoEconomicoService.MAPPING}`,
      http,
      CODIGO_ECONOMICO_CONVERTER
    );
  }

  /**
   * Devuelve los códigos económicos de tipo gasto filtrados por un listado de referencias
   * @param codEconomicoGastosRef referencia del código económico de tipo gasto.
   */
  findByGastos(codEconomicoGastosRef?: string[]): Observable<SgiRestListResult<ICodigoEconomico>> {
    const endpointUrl = codEconomicoGastosRef ? `${this.endpointUrl}/gastos/${codEconomicoGastosRef}` : `${this.endpointUrl}/gastos/`;
    return this.find<ICodigoEconomicoBackend, ICodigoEconomico>(
      endpointUrl,
      null,
      CODIGO_ECONOMICO_CONVERTER
    );
  }

  /**
   * Devuelve los códigos económicos de tipo ingreso filtrados por un listado de referencias
   * @param codEconomicoIngresosRef referencia del código económico de tipo ingreso.
   */
  findByIngresos(codEconomicoIngresosRef?: string[]): Observable<SgiRestListResult<ICodigoEconomico>> {
    const endpointUrl = codEconomicoIngresosRef ? `${this.endpointUrl}/ingresos/${codEconomicoIngresosRef}` : `${this.endpointUrl}/ingresos/`;
    return this.find<ICodigoEconomicoBackend, ICodigoEconomico>(
      endpointUrl,
      null,
      CODIGO_ECONOMICO_CONVERTER
    );
  }

}
