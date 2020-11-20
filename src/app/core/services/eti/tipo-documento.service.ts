import { Injectable } from '@angular/core';
import { ITipoDocumento } from '@core/models/eti/tipo-documento';
import { NGXLogger } from 'ngx-logger';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService extends SgiRestService<number, ITipoDocumento> {
  private static readonly MAPPING = '/tipodocumentos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoDocumentoService.name,
      logger,
      `${environment.serviceServers.eti}${TipoDocumentoService.MAPPING}`,
      http
    );
  }

  /**
   * Devuelve los tipos de comentarios iniciales de una memoria.
   *
   * @return los tipos de comentarios iniciales de una memoria.
   */
  findTiposDocumentoIniciales(options?: SgiRestFindOptions): Observable<SgiRestListResult<ITipoDocumento>> {
    this.logger.debug(TipoDocumentoService.name, `findTiposDocumentoIniciales()`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/iniciales`;
    return this.find<ITipoDocumento, ITipoDocumento>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(TipoDocumentoService.name, `findTiposDocumentoIniciales()`, '-', 'end'))
      );
  }

}
