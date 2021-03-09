import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPersona } from '@core/models/sgp/persona';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';



@Injectable({
  providedIn: 'root'
})
export class PersonaService extends SgiRestService<string, IPersona>{
  private static readonly MAPPING = '/personas/fisica/persona';

  constructor(protected http: HttpClient) {
    super(
      PersonaService.name,
      `${environment.serviceServers.sgp}${PersonaService.MAPPING}`,
      http
    );
  }

}
