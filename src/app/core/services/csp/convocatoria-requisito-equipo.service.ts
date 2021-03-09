import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaRequisitoEquipo } from '@core/models/csp/convocatoria-requisito-equipo';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaRequisitoEquipoService extends SgiRestService<number, IConvocatoriaRequisitoEquipo> {
  private static readonly MAPPING = '/convocatoria-requisitoequipos';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaRequisitoEquipoService.name,
      `${environment.serviceServers.csp}${ConvocatoriaRequisitoEquipoService.MAPPING}`,
      http
    );
  }
}
