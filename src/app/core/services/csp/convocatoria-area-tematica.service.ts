import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaAreaTematicaService extends SgiRestService<number, IConvocatoriaAreaTematica> {
  private static readonly MAPPING = '/convocatoriaareatematicas';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaAreaTematicaService.name,
      `${environment.serviceServers.csp}${ConvocatoriaAreaTematicaService.MAPPING}`,
      http
    );
  }
}
