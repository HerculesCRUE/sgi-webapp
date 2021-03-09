import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITarea } from '@core/models/eti/tarea';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class TareaService extends SgiRestService<number, ITarea> {
  private static readonly MAPPING = '/tareas';

  constructor(protected http: HttpClient) {
    super(
      TareaService.name,
      `${environment.serviceServers.eti}${TareaService.MAPPING}`,
      http
    );
  }
}
