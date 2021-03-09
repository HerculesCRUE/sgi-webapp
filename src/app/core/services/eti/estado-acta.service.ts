import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEstadoActa } from '@core/models/eti/estado-acta';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class EstadoActaService extends SgiRestService<number, IEstadoActa>{

  private static readonly MAPPING = '/estadoactas';

  constructor(protected http: HttpClient) {
    super(EstadoActaService.name,
      `${environment.serviceServers.eti}` + EstadoActaService.MAPPING, http);
  }
}
