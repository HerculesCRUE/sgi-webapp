import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TipoMemoria } from '@core/models/eti/tipo-memoria';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class TipoMemoriaService extends SgiRestService<number, TipoMemoria> {
  private static readonly MAPPING = '/tipomemorias';

  constructor(protected http: HttpClient) {
    super(
      TipoMemoria.name,
      `${environment.serviceServers.eti}${TipoMemoriaService.MAPPING}`,
      http
    );
  }
}
