import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IApartado } from '@core/models/eti/apartado';
import { IBloque } from '@core/models/eti/bloque';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiReadOnlyRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BloqueService extends SgiReadOnlyRestService<number, IBloque> {
  private static readonly MAPPING = '/bloques';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      BloqueService.name,
      logger,
      `${environment.serviceServers.eti}${BloqueService.MAPPING}`,
      http
    );
  }

  /**
   * Devuelve los apartados de un bloque
   *
   * @param id Id del bloque
   * @param options Opciones de paginación
   */
  getApartados(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IApartado>> {
    this.logger.debug(BloqueService.name, `getApartados(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IApartado, IApartado>(`${this.endpointUrl}/${id}/apartados`, options).pipe(
      tap(() => this.logger.debug(BloqueService.name, `getApartados(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
    );
  }
}
