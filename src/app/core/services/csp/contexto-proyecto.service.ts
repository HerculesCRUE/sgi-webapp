import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyectoContexto } from '@core/models/csp/proyecto-contexto';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ContextoProyectoService extends SgiRestService<number, IProyectoContexto> {
  private static readonly MAPPING = '/proyecto-contextoproyectos';

  constructor(protected http: HttpClient) {
    super(
      ContextoProyectoService.name,
      `${environment.serviceServers.csp}${ContextoProyectoService.MAPPING}`,
      http
    );
  }

}
