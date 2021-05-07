import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONVOCATORIA_CONCEPTO_GASTO_CODIGO_EC_CONVERTER } from '@core/converters/csp/convocatoria-concepto-gasto-codigo-ec.converter';
import { IConvocatoriaConceptoGastoCodigoEcBackend } from '@core/models/csp/backend/convocatoria-concepto-gasto-codigo-ec-backend';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { IRolProyectoColectivo } from '@core/models/csp/rol-proyecto-colectivo';
import { environment } from '@env';
import { SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolProyectoService extends SgiRestService<number, IRolProyecto> {
  private static readonly MAPPING = '/rolproyectos';

  constructor(protected http: HttpClient) {
    super(
      RolProyectoService.name,
      `${environment.serviceServers.csp}${RolProyectoService.MAPPING}`,
      http
    );
  }

  /**
   * Recupera listado de RolProyectoColectivo a partir del RolProyecto.
   * @param id RolProyecto
   * @return listado RolProyectoColectivo
   */
  findAllColectivos(id: number): Observable<SgiRestListResult<string>> {
    const endpointUrl = `${this.endpointUrl}/${id}/colectivos`;
    return this.find<string, string>(endpointUrl, null);
  }
}
