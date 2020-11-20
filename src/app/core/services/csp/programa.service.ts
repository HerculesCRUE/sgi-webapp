import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { IPrograma } from '@core/models/csp/programa';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProgramaService extends SgiRestService<number, IPrograma> {

  private static readonly MAPPING = '/programas';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ProgramaService.name,
      logger,
      `${environment.serviceServers.csp}${ProgramaService.MAPPING}`,
      http
    );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IPrograma>> {
    this.logger.debug(ProgramaService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<IPrograma, IPrograma>(`${this.endpointUrl}/plan/todos`, options).pipe(
      tap(() => this.logger.debug(ProgramaService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

  findAllPlan(options?: SgiRestFindOptions): Observable<SgiRestListResult<IPrograma>> {
    this.logger.debug(ProgramaService.name, `${this.findAllPlan.name}(`, '-', 'start');
    return this.find<IPrograma, IPrograma>(`${this.endpointUrl}/plan`, options).pipe(
      tap(() => this.logger.debug(ProgramaService.name, `${this.findAllPlan.name}()`, '-', 'end'))
    );
  }

  findAllHijosPrograma(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IPrograma>> {
    this.logger.debug(ProgramaService.name, `${this.findAllHijosPrograma.name}(`, '-', 'start');
    return this.find<IPrograma, IPrograma>(`${this.endpointUrl}/${id}/hijos`, options).pipe(
      tap(() => this.logger.debug(ProgramaService.name, `${this.findAllHijosPrograma.name}()`, '-', 'end'))
    );
  }

  deactivate(id: number): Observable<void> {
    this.logger.debug(ProgramaService.name, `${this.deactivate.name}(`, '-', 'start');
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, undefined).pipe(
      tap(() => this.logger.debug(ProgramaService.name, `${this.deactivate.name}()`, '-', 'end'))
    );
  }

  activate(id: number): Observable<void> {
    this.logger.debug(ProgramaService.name, `${this.activate.name}(`, '-', 'start');
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, undefined).pipe(
      tap(() => this.logger.debug(ProgramaService.name, `${this.activate.name}()`, '-', 'end'))
    );
  }
}
