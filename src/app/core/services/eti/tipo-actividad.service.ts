import { Injectable } from '@angular/core';
import { SgiRestService } from '@sgi/framework/http';
import { ITipoActividad } from '@core/models/eti/tipo-actividad';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class TipoActividadService extends SgiRestService<number, ITipoActividad> {
  private static readonly MAPPING = '/tipoactividades';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoActividadService.name,
      logger,
      `${environment.serviceServers.eti}${TipoActividadService.MAPPING}`,
      http
    );
  }
}
