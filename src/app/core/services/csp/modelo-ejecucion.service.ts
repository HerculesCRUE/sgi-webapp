import { Injectable } from '@angular/core';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { of, Observable } from 'rxjs';
import { IModeloEjecucion, ITipoHito } from '@core/models/csp/tipos-configuracion';
import { IModeloTipoEnlace } from '@core/models/csp/modelo-tipo-enlace';
import { tap } from 'rxjs/operators';
import { IModeloTipoFinalidad } from '@core/models/csp/modelo-tipo-finalidad';
import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { IModeloTipoDocumento } from '@core/models/csp/modelo-tipo-documento';
import { IModeloTipoHito } from '@core/models/csp/modelo-tipo-hito';
import { ModeloUnidadService, IModeloUnidadBackend } from './modelo-unidad.service';
import { IModeloUnidad } from '@core/models/csp/modelo-unidad';

const tiposHito: ITipoHito[] = [
  {
    id: 1, nombre: 'Resolución interna', descripcion: '', activo: false
  },
  {
    id: 2, nombre: 'Resolución definitiva', descripcion: '', activo: false
  } as ITipoHito

];


@Injectable({
  providedIn: 'root'
})
export class ModeloEjecucionService extends SgiRestService<number, IModeloEjecucion> {
  private static readonly MAPPING = '/modeloejecuciones';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ModeloEjecucionService.name,
      logger,
      `${environment.serviceServers.csp}${ModeloEjecucionService.MAPPING}`,
      http
    );
  }


  /**
   * Recupera los hitos de una convocatoria
   * @param idModeloEjecucion Identificador del modelo de ejecución.
   * @returns Listado de tipos de hitos.
   */
  findTipoHitos(idModeloEjecucion: number): Observable<SgiRestListResult<ITipoHito>> {
    this.logger.debug(ModeloEjecucionService.name, `findTipoHitos(idModeloEjecucion)`, '-', 'START');
    return of({
      page: null,
      total: tiposHito.length,
      items: tiposHito
    } as SgiRestListResult<ITipoHito>);
  }

  findModeloTipoEnlace(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoEnlace>> {
    this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoEnlace.name}(id: ${id})`, '-', 'START');
    return this.find<IModeloTipoEnlace, IModeloTipoEnlace>(`${this.endpointUrl}/${id}/modelotipoenlaces`, options).pipe(
      tap(() => this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoEnlace.name}(id: ${id})`, '-', 'END'))
    );
  }

  findModeloTipoFinalidad(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoFinalidad>> {
    this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoFinalidad.name}(id: ${id})`, '-', 'START');
    return this.find<IModeloTipoFinalidad, IModeloTipoFinalidad>(`${this.endpointUrl}/${id}/modelotipofinalidades`, options).pipe(
      tap(() => this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoFinalidad.name}(id: ${id})`, '-', 'END'))
    );
  }

  /**
   * Muestra todos los modelos tipo de fase
   * @param id modelo de ejecucion
   * @param options opciones de búsqueda.
   */
  findModeloTipoFase(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoFase>> {
    this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoFase.name}(id: ${id})`, '-', 'START');
    return this.find<IModeloTipoFase, IModeloTipoFase>(`${this.endpointUrl}/${id}/modelotipofases/convocatoria`, options).pipe(
      tap(() => this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoFase.name}(id: ${id})`, '-', 'END'))
    );
  }

  /**
   * Muestra todos los modelos tipo de documento
   * @param id modelo de ejecucion
   * @param options opciones de búsqueda.
   */
  findModeloTipoDocumento(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoDocumento>> {
    this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoDocumento.name}(id: ${id})`, '-', 'START');
    return this.find<IModeloTipoDocumento, IModeloTipoDocumento>(`${this.endpointUrl}/${id}/modelotipodocumentos`, options).pipe(
      tap(() => this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoDocumento.name}(id: ${id})`, '-', 'END'))
    );
  }

  findModeloTipoHito(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoHito>> {
    this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoHito.name}(id: ${id})`, '-', 'START');
    return this.find<IModeloTipoHito, IModeloTipoHito>(`${this.endpointUrl}/${id}/modelotipohitos`, options).pipe(
      tap(() => this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoHito.name}(id: ${id})`, '-', 'END'))
    );
  }

  /**
   * Encuentra unidades de gestion
   */
  findModeloTipoUnidadGestion(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloUnidad>> {
    this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoUnidadGestion.name}(id: ${id})`, '-', 'START');
    return this.find<IModeloUnidadBackend, IModeloUnidad>(`${this.endpointUrl}/${id}/modelounidades`,
      options, ModeloUnidadService.CONVERTER).pipe(
        tap(() => this.logger.debug(ModeloEjecucionService.name, `${this.findModeloTipoUnidadGestion.name}(id: ${id})`, '-', 'END'))
      );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloEjecucion>> {
    this.logger.debug(ModeloEjecucionService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<IModeloEjecucion, IModeloEjecucion>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(ModeloEjecucionService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

}
