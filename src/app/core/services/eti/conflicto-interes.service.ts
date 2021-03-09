import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConflictoInteres } from '@core/models/eti/conflicto-interes';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';

@Injectable({
  providedIn: 'root'
})
export class ConflictoInteresService extends SgiRestService<number, IConflictoInteres> {
  private static readonly MAPPING = '/conflictosinteres';

  constructor(protected http: HttpClient) {
    super(
      ConflictoInteresService.name,
      `${environment.serviceServers.eti}${ConflictoInteresService.MAPPING}`,
      http
    );
  }
}
