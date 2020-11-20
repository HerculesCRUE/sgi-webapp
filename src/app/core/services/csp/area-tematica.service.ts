import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AreaTematicaService extends SgiRestService<number, IAreaTematica> {
  private static readonly MAPPING = '/areatematicas';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      AreaTematicaService.name,
      logger,
      `${environment.serviceServers.csp}${AreaTematicaService.MAPPING}`,
      http
    );
  }

  findAllGrupo(options?: SgiRestFindOptions): Observable<SgiRestListResult<IAreaTematica>> {
    this.logger.debug(AreaTematicaService.name, `${this.findAllGrupo.name}(`, '-', 'start');
    return this.find<IAreaTematica, IAreaTematica>(`${this.endpointUrl}/grupo`, options).pipe(
      tap(() => this.logger.debug(AreaTematicaService.name, `${this.findAllGrupo.name}()`, '-', 'end'))
    );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IAreaTematica>> {
    this.logger.debug(AreaTematicaService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<IAreaTematica, IAreaTematica>(`${this.endpointUrl}/grupo/todos`, options).pipe(
      tap(() => this.logger.debug(AreaTematicaService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

  /**
   * Encuentra todos los hijos del padre (mat-tree)
   * @param id numero padre
   * @param options opciones de busqueda
   */
  findAllHijosArea(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IAreaTematica>> {
    this.logger.debug(AreaTematicaService.name, `${this.findAllHijosArea.name}(`, '-', 'start');
    return this.find<IAreaTematica, IAreaTematica>(`${this.endpointUrl}/${id}/hijos`, options).pipe(
      tap(() => this.logger.debug(AreaTematicaService.name, `${this.findAllHijosArea.name}()`, '-', 'end'))
    );
  }

  /**
   * Desactivar area tematica
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    this.logger.debug(AreaTematicaService.name, `${this.desactivar.name}(`, '-', 'start');
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, undefined).pipe(
      tap(() => this.logger.debug(AreaTematicaService.name, `${this.desactivar.name}()`, '-', 'end'))
    );
  }

  /**
   * Reactivar area tematica
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    this.logger.debug(AreaTematicaService.name, `${this.reactivar.name}(`, '-', 'start');
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, undefined).pipe(
      tap(() => this.logger.debug(AreaTematicaService.name, `${this.reactivar.name}()`, '-', 'end'))
    );
  }
}
