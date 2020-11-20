import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConceptoGasto } from '@core/models/csp/tipos-configuracion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConceptoGastoService extends SgiRestService<number, IConceptoGasto> {
  private static readonly MAPPING = '/conceptogastos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConceptoGastoService.name,
      logger,
      `${environment.serviceServers.csp}${ConceptoGastoService.MAPPING}`,
      http
    );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConceptoGasto>> {
    this.logger.debug(ConceptoGastoService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<IConceptoGasto, IConceptoGasto>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(ConceptoGastoService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

  /**
   * Reactivar conceptos de gasto
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    this.logger.debug(ConceptoGastoService.name, `${this.reactivar.name}(${id}`, '-', 'start');
    return this.http.patch(`${this.endpointUrl}/${id}/reactivar`, { id }).pipe(
      map(() => this.logger.debug(ConceptoGastoService.name, `${this.reactivar.name}(${id}`, '-', 'end'))
    );
  }

  /**
   * Desactivar conceptos de gasto
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    this.logger.debug(ConceptoGastoService.name, `${this.desactivar.name}(${id}`, '-', 'start');
    return this.http.patch(`${this.endpointUrl}/${id}/desactivar`, { id }).pipe(
      map(() => this.logger.debug(ConceptoGastoService.name, `${this.desactivar.name}(${id}`, '-', 'end'))
    );
  }


}
