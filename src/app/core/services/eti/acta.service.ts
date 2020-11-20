import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@env';
import { NGXLogger } from 'ngx-logger';

import { tap } from 'rxjs/operators';

import { SgiRestFindOptions, SgiRestService } from '@sgi/framework/http';

import { IActa } from '@core/models/eti/acta';
import { IActaEvaluaciones } from '@core/models/eti/acta-evaluaciones';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ActaService extends SgiRestService<number, IActa> {
  private static readonly MAPPING = '/actas';


  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ActaService.name,
      logger,
      `${environment.serviceServers.eti}${ActaService.MAPPING}`,
      http
    );
  }

  /**
   * Recupera el listado de actas activas con el número de evaluaciones iniciales, en revisión y las totales de ambas.
   * @param options opciones de búsqueda.
   * @returns listado de actas.
   */
  findActivasWithEvaluaciones(options?: SgiRestFindOptions) {
    this.logger.debug(ActaService.name, `findActivasWithEvaluaciones(${options ? JSON.stringify(options) : ''})`, '-', 'START');
    return this.find<IActaEvaluaciones, IActaEvaluaciones>(`${this.endpointUrl}`, options).pipe(
      tap(() => this.logger.debug(ActaService.name, `findActivasWithEvaluaciones(${options ? JSON.stringify(options) : ''})`, '-', 'END'))
    );
  }


  /**
   * Finaliza el acta recibido por parámetro.
   * @param actaId id de acta.
   */
  finishActa(actaId: number): Observable<IActa[]> {
    this.logger.debug(ActaService.name, `findActivasWithEvaluaciones(${actaId})`, '-', 'START');
    return this.http.put<IActa[]>(`${this.endpointUrl}/${actaId}/finalizar`, null).pipe(
      tap(() => this.logger.debug(ActaService.name, `updateComentarios(${actaId})`, '-', 'end'))
    );
  }


}
