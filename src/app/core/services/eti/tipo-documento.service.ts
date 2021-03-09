import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITipoDocumento } from '@core/models/eti/tipo-documento';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http/';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService extends SgiRestService<number, ITipoDocumento> {
  private static readonly MAPPING = '/tipodocumentos';

  constructor(protected http: HttpClient) {
    super(
      TipoDocumentoService.name,
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
    const endpointUrl = `${this.endpointUrl}/iniciales`;
    return this.find<ITipoDocumento, ITipoDocumento>(endpointUrl, options);
  }

}
