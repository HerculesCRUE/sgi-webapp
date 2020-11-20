import { Injectable } from '@angular/core';
import { EstadoMemoria } from '@core/models/eti/estado-memoria';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class EstadoMemoriaService extends SgiRestService<number, EstadoMemoria>{

  private static readonly MAPPING = '/estadomemorias';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(EstadoMemoriaService.name, logger,
      `${environment.serviceServers.eti}` + EstadoMemoriaService.MAPPING, http);
  }
}
