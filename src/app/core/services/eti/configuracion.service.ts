import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { SgiRestService, SgiRestListResult } from '@sgi/framework/http';
import { IConfiguracion } from '@core/models/eti/configuracion';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService extends SgiRestService<number, IConfiguracion>{

  private static readonly MAPPING = '/configuraciones';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(ConfiguracionService.name, logger,
      `${environment.serviceServers.eti}` + ConfiguracionService.MAPPING, http);
  }

  /**
   * Devuelve la configuración por su clave
   * @param clave la clave de la configuración.
   */
  getConfiguracion(): Observable<IConfiguracion> {
    this.logger.debug(ConfiguracionService.name, `getConfiguracion()`, '-', 'START');
    return this.http.get<IConfiguracion>(`${this.endpointUrl}`).pipe(
      tap(() => this.logger.debug(ConfiguracionService.name, `getConfiguracion()`, '-', 'END'))
    );
  }
}
