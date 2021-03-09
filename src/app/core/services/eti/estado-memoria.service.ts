import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EstadoMemoria } from '@core/models/eti/estado-memoria';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class EstadoMemoriaService extends SgiRestService<number, EstadoMemoria>{

  private static readonly MAPPING = '/estadomemorias';

  constructor(protected http: HttpClient) {
    super(EstadoMemoriaService.name,
      `${environment.serviceServers.eti}` + EstadoMemoriaService.MAPPING, http);
  }
}
