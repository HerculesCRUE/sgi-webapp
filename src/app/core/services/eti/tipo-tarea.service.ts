import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { NGXLogger } from 'ngx-logger';
import { SgiRestService } from '@sgi/framework/http';
import { TipoTarea } from '@core/models/eti/tipo-tarea';

@Injectable({
  providedIn: 'root'
})
export class TipoTareaService extends SgiRestService<number, TipoTarea> {
  private static readonly MAPPING = '/tipostarea';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      TipoTareaService.name,
      logger,
      `${environment.serviceServers.eti}${TipoTareaService.MAPPING}`,
      http
    );
  }
}
