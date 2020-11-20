import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IModeloTipoHito } from '@core/models/csp/modelo-tipo-hito';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class ModeloTipoHitoService extends SgiRestService<number, IModeloTipoHito> {
  private static readonly MAPPING = '/modelotipohitos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ModeloTipoHitoService.name,
      logger,
      `${environment.serviceServers.csp}${ModeloTipoHitoService.MAPPING}`,
      http
    );
  }
}
