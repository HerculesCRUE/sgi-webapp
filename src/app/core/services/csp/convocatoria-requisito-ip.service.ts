import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaRequisitoIP } from '@core/models/csp/convocatoria-requisito-ip';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaRequisitoIPService extends SgiRestService<number, IConvocatoriaRequisitoIP> {
  private static readonly MAPPING = '/convocatoria-requisitoips';

  constructor(private readonly logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaRequisitoIPService.name,
      `${environment.serviceServers.csp}${ConvocatoriaRequisitoIPService.MAPPING}`,
      http
    );
  }

  /**
   * Recupera el requisito ip de la convocatoria
   * @param id convocatoria
   */
  getRequisitoIPConvocatoria(id: number): Observable<IConvocatoriaRequisitoIP> {
    const endpointUrl = `${this.endpointUrl}/${id}`;
    return this.http.get<IConvocatoriaRequisitoIP>(endpointUrl)
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          return of({} as IConvocatoriaRequisitoIP);
        })
      );
  }
}
