import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoSocioPeriodoJustificacion } from '@core/models/csp/proyecto-socio-periodo-justificacion';
import { ISocioPeriodoJustificacionDocumento } from '@core/models/csp/socio-periodo-justificacion-documento';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectoSocioPeriodoJustificacionService extends SgiRestService<number, IProyectoSocioPeriodoJustificacion> {
  private static readonly MAPPING = '/proyectosocioperiodojustificaciones';

  constructor(protected http: HttpClient) {
    super(
      ProyectoSocioPeriodoJustificacionService.name,
      `${environment.serviceServers.csp}${ProyectoSocioPeriodoJustificacionService.MAPPING}`,
      http
    );
  }

  updateList(proyectoSolictudSocioId: number, entities: IProyectoSocioPeriodoJustificacion[]):
    Observable<IProyectoSocioPeriodoJustificacion[]> {
    return this.http.patch<IProyectoSocioPeriodoJustificacion[]>(
      `${this.endpointUrl}/${proyectoSolictudSocioId}`, entities);
  }

  /**
   * Devuelve el listado de ISocioPeriodoJustificacionDocumento de un IProyectoSocioPeriodoJustificacion
   *
   * @param id Id del IProyectoSocioPeriodoJustificacion
   */
  findAllSocioPeriodoJustificacionDocumento(id: number, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<ISocioPeriodoJustificacionDocumento>> {
    return this.find<ISocioPeriodoJustificacionDocumento, ISocioPeriodoJustificacionDocumento>(
      `${this.endpointUrl}/${id}/socioperiodojustificaciondocumentos`, options);
  }
}
