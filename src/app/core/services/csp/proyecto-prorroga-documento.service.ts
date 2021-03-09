import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoProrrogaDocumento } from '@core/models/csp/proyecto-prorroga-documento';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ProyectoProrrogaDocumentoService extends SgiRestService<number, IProyectoProrrogaDocumento> {
  private static readonly MAPPING = '/prorrogadocumentos';

  constructor(protected http: HttpClient) {
    super(
      ProyectoProrrogaDocumentoService.name,
      `${environment.serviceServers.csp}${ProyectoProrrogaDocumentoService.MAPPING}`,
      http
    );
  }

}
