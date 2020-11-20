import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IApartado } from '@core/models/eti/apartado';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiReadOnlyRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApartadoService extends SgiReadOnlyRestService<number, IApartado> {
  private static readonly MAPPING = '/apartados';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ApartadoService.name,
      logger,
      `${environment.serviceServers.eti}${ApartadoService.MAPPING}`,
      http
    );
  }

  /**
   * Devuelve los apartados hijos de un apartado
   *
   * @param id Id del apartado
   * @param options Opciones de paginación
   */
  getHijos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IApartado>> {
    this.logger.debug(ApartadoService.name, `getHijos(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IApartado, IApartado>(`${this.endpointUrl}/${id}/hijos`, options).pipe(
      tap(() => this.logger.debug(ApartadoService.name, `getHijos(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
    );
  }
}
