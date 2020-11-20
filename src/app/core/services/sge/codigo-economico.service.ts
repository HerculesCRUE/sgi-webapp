import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ICodigoEconomico } from '@core/models/sge/codigo-economico';

@Injectable({
  providedIn: 'root'
})
export class CodigoEconomicoService extends SgiRestService<string, ICodigoEconomico>{
  private static readonly MAPPING = '/codigoeconomicos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(CodigoEconomicoService.name, logger,
      `${environment.serviceServers.sge}${CodigoEconomicoService.MAPPING}`, http);
  }

  /**
   * Devuelve los códigos económicos de tipo gasto filtrados por un listado de referencias
   * @param codEconomicoGastosRef referencia del código económico de tipo gasto.
   */
  findByGastos(codEconomicoGastosRef?: string[]): Observable<SgiRestListResult<ICodigoEconomico>> {
    this.logger.debug(CodigoEconomicoService.name, `findByGastos(${codEconomicoGastosRef})`, '-', 'START');
    const endpointUrl = codEconomicoGastosRef ? `${this.endpointUrl}/gastos/${codEconomicoGastosRef}` : `${this.endpointUrl}/gastos/`;
    return this.find<ICodigoEconomico, ICodigoEconomico>(endpointUrl).pipe(
      tap(() => this.logger.debug(CodigoEconomicoService.name, `findByGastos(${codEconomicoGastosRef})`, '-', 'END'))
    );
  }

  /**
   * Devuelve los códigos económicos de tipo ingreso filtrados por un listado de referencias
   * @param codEconomicoIngresosRef referencia del código económico de tipo ingreso.
   */
  findByIngresos(codEconomicoIngresosRef?: string[]): Observable<SgiRestListResult<ICodigoEconomico>> {
    this.logger.debug(CodigoEconomicoService.name, `findByIngresos(${codEconomicoIngresosRef})`, '-', 'START');
    const endpointUrl = codEconomicoIngresosRef ? `${this.endpointUrl}/ingresos/${codEconomicoIngresosRef}` : `${this.endpointUrl}/ingresos/`;
    return this.find<ICodigoEconomico, ICodigoEconomico>(endpointUrl).pipe(
      tap(() => this.logger.debug(CodigoEconomicoService.name, `findByIngresos(${codEconomicoIngresosRef})`, '-', 'END'))
    );
  }

}
