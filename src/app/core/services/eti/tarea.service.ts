import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITarea } from '@core/models/eti/tarea';
import { environment } from '@env';
import { NGXLogger } from 'ngx-logger';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class TareaService extends SgiRestService<number, ITarea> {
  private static readonly MAPPING = '/tareas';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TareaService.name,
      logger,
      `${environment.serviceServers.eti}${TareaService.MAPPING}`,
      http
    );
  }
}
