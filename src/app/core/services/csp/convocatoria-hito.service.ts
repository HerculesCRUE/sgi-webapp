import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaHitoService extends SgiRestService<number, IConvocatoriaHito> {
  private static readonly MAPPING = '/convocatoriahitos';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaHitoService.name,
      `${environment.serviceServers.csp}${ConvocatoriaHitoService.MAPPING}`,
      http
    );
  }

}