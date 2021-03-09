import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class RolProyectoService extends SgiRestService<number, IRolProyecto> {
  private static readonly MAPPING = '/rolproyectos';

  constructor(protected http: HttpClient) {
    super(
      RolProyectoService.name,
      `${environment.serviceServers.csp}${RolProyectoService.MAPPING}`,
      http
    );
  }
}
