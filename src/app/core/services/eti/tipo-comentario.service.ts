import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TipoComentario } from '@core/models/eti/tipo-comentario';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class TipoComentarioService extends SgiRestService<number, TipoComentario> {
  private static readonly MAPPING = '/tipocomentarios';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoComentarioService.name,
      logger,
      `${environment.serviceServers.eti}${TipoComentarioService.MAPPING}`,
      http
    );
  }
}
