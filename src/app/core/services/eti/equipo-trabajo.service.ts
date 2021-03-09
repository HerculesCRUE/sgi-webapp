import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class EquipoTrabajoService extends SgiRestService<number, IEquipoTrabajo> {
  private static readonly MAPPING = '/equipotrabajos';

  constructor(protected http: HttpClient) {
    super(
      EquipoTrabajoService.name,
      `${environment.serviceServers.eti}${EquipoTrabajoService.MAPPING}`,
      http
    );
  }
}
