import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { TipoMemoria } from '@core/models/eti/tipo-memoria';

@Injectable({
  providedIn: 'root'
})
export class TipoMemoriaService extends SgiRestService<number, TipoMemoria> {
  private static readonly MAPPING = '/tipomemorias';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoMemoria.name,
      logger,
      `${environment.serviceServers.eti}${TipoMemoriaService.MAPPING}`,
      http
    );
  }
}
