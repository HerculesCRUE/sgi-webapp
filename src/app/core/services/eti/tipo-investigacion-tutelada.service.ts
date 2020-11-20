import { Injectable } from '@angular/core';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { ITipoInvestigacionTutelada } from '@core/models/eti/tipo-investigacion-tutelada';

@Injectable({
  providedIn: 'root'
})
export class TipoInvestigacionTuteladaService extends SgiRestService<number, ITipoInvestigacionTutelada> {
  private static readonly MAPPING = '/tipoinvestigaciontuteladas';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoInvestigacionTuteladaService.name,
      logger,
      `${environment.serviceServers.eti}${TipoInvestigacionTuteladaService.MAPPING}`,
      http
    );
  }
}
