import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { NGXLogger } from 'ngx-logger';
import { SgiRestService } from '@sgi/framework/http';
import { FormacionEspecifica } from '@core/models/eti/formacion-especifica';

@Injectable({
  providedIn: 'root'
})
export class FormacionEspecificaService extends SgiRestService<number, FormacionEspecifica> {
  private static readonly MAPPING = '/formacionespecificas';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      FormacionEspecificaService.name,
      logger,
      `${environment.serviceServers.eti}${FormacionEspecificaService.MAPPING}`,
      http
    );
  }
}
