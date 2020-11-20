import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { NGXLogger } from 'ngx-logger';
import { SgiRestService } from '@sgi/framework/http';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';

@Injectable({
  providedIn: 'root'
})
export class EquipoTrabajoService extends SgiRestService<number, IEquipoTrabajo> {
  private static readonly MAPPING = '/equipotrabajos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      EquipoTrabajoService.name,
      logger,
      `${environment.serviceServers.eti}${EquipoTrabajoService.MAPPING}`,
      http
    );
  }
}
