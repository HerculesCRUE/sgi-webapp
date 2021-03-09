import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaEnlaceService extends SgiRestService<number, IConvocatoriaEnlace> {
  private static readonly MAPPING = '/convocatoriaenlaces';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaEnlaceService.name,
      `${environment.serviceServers.csp}${ConvocatoriaEnlaceService.MAPPING}`,
      http
    );
  }

}