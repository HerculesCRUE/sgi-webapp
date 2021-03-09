import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoPlazos } from '@core/models/csp/proyecto-plazo';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ProyectoPlazoService extends SgiRestService<number, IProyectoPlazos> {
  private static readonly MAPPING = '/proyectofases';

  constructor(protected http: HttpClient) {
    super(
      ProyectoPlazoService.name,
      `${environment.serviceServers.csp}${ProyectoPlazoService.MAPPING}`,
      http
    );
  }

}
