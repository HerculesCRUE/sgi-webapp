import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAsistente } from '@core/models/eti/asistente';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class AsistenteService extends SgiRestService<number, IAsistente>{

  private static readonly MAPPING = '/asistentes';

  constructor(protected http: HttpClient) {
    super(AsistenteService.name, `${environment.serviceServers.eti}${AsistenteService.MAPPING}`, http);
  }

}
