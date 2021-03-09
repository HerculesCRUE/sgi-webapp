import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IActa } from '@core/models/eti/acta';
import { IActaEvaluaciones } from '@core/models/eti/acta-evaluaciones';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})

export class ActaService extends SgiRestService<number, IActa> {
  private static readonly MAPPING = '/actas';


  constructor(protected http: HttpClient) {
    super(
      ActaService.name,
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
    return this.find<IActaEvaluaciones, IActaEvaluaciones>(`${this.endpointUrl}`, options);
  }


  /**
   * Finaliza el acta recibido por parámetro.
   * @param actaId id de acta.
   */
  finishActa(actaId: number): Observable<IActa[]> {
    return this.http.put<IActa[]>(`${this.endpointUrl}/${actaId}/finalizar`, null);
  }


}
