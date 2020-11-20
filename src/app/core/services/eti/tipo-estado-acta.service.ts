import { Injectable } from '@angular/core';
import { TipoEstadoActa } from '@core/models/eti/tipo-estado-acta';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class TipoEstadoActaService extends SgiRestService<number, TipoEstadoActa> {
  private static readonly MAPPING = '/tipoestadoactas';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoEstadoActaService.name,
      logger,
      `${environment.serviceServers.eti}${TipoEstadoActaService.MAPPING}`,
      http
    );
  }
}
