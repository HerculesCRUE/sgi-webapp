import { Injectable } from '@angular/core';
import { SgiRestService } from '@sgi/framework/http/';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class TipoAmbitoGeograficoService extends SgiRestService<number, ITipoAmbitoGeografico> {
  private static readonly MAPPING = '/tipoambitogeograficos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoAmbitoGeograficoService.name,
      logger,
      `${environment.serviceServers.csp}${TipoAmbitoGeograficoService.MAPPING}`,
      http
    );
  }
}
