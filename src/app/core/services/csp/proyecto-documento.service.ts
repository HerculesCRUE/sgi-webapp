import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoDocumento } from '@core/models/csp/proyecto-documento';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProyectoDocumentoService extends SgiRestService<number, IProyectoDocumento> {
  private static readonly MAPPING = '/proyectodocumentos';

  constructor(protected http: HttpClient) {
    super(
      ProyectoDocumentoService.name,
      `${environment.serviceServers.csp}${ProyectoDocumentoService.MAPPING}`,
      http
    );
  }


  updateList(proyectoId: number, entities: IProyectoDocumento[]):
    Observable<IProyectoDocumento[]> {

    return this.http.patch<IProyectoDocumento[]>(
      `${this.endpointUrl}/${proyectoId}`, entities);
  }
}
