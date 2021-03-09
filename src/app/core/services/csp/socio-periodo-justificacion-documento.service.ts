import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISocioPeriodoJustificacionDocumento } from '@core/models/csp/socio-periodo-justificacion-documento';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocioPeriodoJustificacionDocumentoService extends SgiRestService<number, ISocioPeriodoJustificacionDocumento> {
  private static readonly MAPPING = '/socioperiodojustificaciondocumentos';

  constructor(protected http: HttpClient) {
    super(
      SocioPeriodoJustificacionDocumentoService.name,
      `${environment.serviceServers.csp}${SocioPeriodoJustificacionDocumentoService.MAPPING}`,
      http
    );
  }

  updateList(proyectoSocioPeriodoJustificacionId: number, entities: ISocioPeriodoJustificacionDocumento[]):
    Observable<ISocioPeriodoJustificacionDocumento[]> {
    return this.http.patch<ISocioPeriodoJustificacionDocumento[]>(
      `${this.endpointUrl}/${proyectoSocioPeriodoJustificacionId}`, entities);
  }
}
