import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoHito } from '@core/models/csp/proyecto-hito';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ProyectoHitoService extends SgiRestService<number, IProyectoHito> {
  private static readonly MAPPING = '/proyectohitos';

  constructor(protected http: HttpClient) {
    super(
      ProyectoHitoService.name,
      `${environment.serviceServers.csp}${ProyectoHitoService.MAPPING}`,
      http
    );
  }

}