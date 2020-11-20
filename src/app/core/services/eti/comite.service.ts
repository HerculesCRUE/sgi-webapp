import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { SgiReadOnlyRestService, SgiRestListResult, SgiRestFindOptions } from '@sgi/framework/http';
import { environment } from '@env';
import { IComite } from '@core/models/eti/comite';
import { Observable } from 'rxjs';
import { TipoMemoria } from '@core/models/eti/tipo-memoria';
import { tap } from 'rxjs/operators';
import { IMemoria } from '@core/models/eti/memoria';

@Injectable({
  providedIn: 'root',
})
export class ComiteService extends SgiReadOnlyRestService<number, IComite> {

  private static readonly MAPPING = '/comites';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ComiteService.name,
      logger,
      `${environment.serviceServers.eti}${ComiteService.MAPPING}`,
      http
    );
  }

  /**
   * Recupera la lista paginada de los tipos de memoria en función del comité recibido.
   * @param id Identificador del comité.
   * @param options Opciones de búsqueda.
   */
  findTipoMemoria(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<TipoMemoria>> {
    this.logger.debug(ComiteService.name, `findTipoMemoria(${id}, ${options ? JSON.stringify(options) : ''})`, '-', 'START');

    return this.find<TipoMemoria, TipoMemoria>(`${this.endpointUrl}/${id}/tipo-memorias`, options).pipe(
      tap(() => this.logger.debug(ComiteService.name, `findTipoMemoria(${id}, ${options ? JSON.stringify(options) : ''})`, '-', 'end'))
    );

  }

  /**
   * Recupera la lista paginada de las  memorias en función del comité recibido.
   * @param id Identificador del comité.
   * @param options Opciones de búsqueda.
   */
  findMemorias(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IMemoria>> {
    this.logger.debug(ComiteService.name, `findMemorias(${id}, ${options ? JSON.stringify(options) : ''})`, '-', 'START');

    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/${id}/memorias`, options).pipe(
      tap(() => this.logger.debug(ComiteService.name, `findMemorias(${id}, ${options ? JSON.stringify(options) : ''})`, '-', 'end'))
    );

  }
}
