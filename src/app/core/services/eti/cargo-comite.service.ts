import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { SgiRestService } from '@sgi/framework/http';
import { environment } from '@env';
import { CargoComite } from '@core/models/eti/cargo-comite';

@Injectable({
  providedIn: 'root',
})
export class CargoComiteService extends SgiRestService<number, CargoComite> {
  private static readonly MAPPING = '/cargocomites';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      CargoComiteService.name,
      logger,
      `${environment.serviceServers.eti}${CargoComiteService.MAPPING}`,
      http
    );
  }
}
