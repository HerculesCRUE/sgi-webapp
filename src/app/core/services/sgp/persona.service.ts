import { Injectable } from '@angular/core';
import { IPersona } from '@core/models/sgp/persona';
import { environment } from '@env';
import { NGXLogger } from 'ngx-logger';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class PersonaService extends SgiRestService<string, IPersona>{
  private static readonly MAPPING = '/personas/fisica/persona';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      PersonaService.name,
      logger,
      `${environment.serviceServers.sgp}${PersonaService.MAPPING}`,
      http
    );
  }

}
