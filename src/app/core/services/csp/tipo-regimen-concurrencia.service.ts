import { Injectable } from '@angular/core';
import { SgiRestService } from '@sgi/framework/http/';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { ITipoRegimenConcurrencia } from '@core/models/csp/tipo-regimen-concurrencia';

@Injectable({
  providedIn: 'root'
})
export class TipoRegimenConcurrenciaService extends SgiRestService<number, ITipoRegimenConcurrencia> {
  private static readonly MAPPING = '/tiporegimenconcurrencias';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoRegimenConcurrenciaService.name,
      logger,
      `${environment.serviceServers.csp}${TipoRegimenConcurrenciaService.MAPPING}`,
      http
    );
  }
}
