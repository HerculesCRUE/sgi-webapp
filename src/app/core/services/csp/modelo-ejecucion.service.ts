import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IModeloTipoDocumento } from '@core/models/csp/modelo-tipo-documento';
import { IModeloTipoEnlace } from '@core/models/csp/modelo-tipo-enlace';
import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { IModeloTipoFinalidad } from '@core/models/csp/modelo-tipo-finalidad';
import { IModeloTipoHito } from '@core/models/csp/modelo-tipo-hito';
import { IModeloUnidad } from '@core/models/csp/modelo-unidad';
import { IModeloEjecucion, ITipoHito } from '@core/models/csp/tipos-configuracion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http/';
import { Observable, of } from 'rxjs';
import { IModeloUnidadBackend, ModeloUnidadService } from './modelo-unidad.service';

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

  constructor(protected http: HttpClient) {
    super(
      ModeloEjecucionService.name,
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
    return of({
      page: null,
      total: tiposHito.length,
      items: tiposHito
    } as SgiRestListResult<ITipoHito>);
  }

  findModeloTipoEnlace(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoEnlace>> {
    return this.find<IModeloTipoEnlace, IModeloTipoEnlace>(`${this.endpointUrl}/${id}/modelotipoenlaces`, options);
  }

  findModeloTipoFinalidad(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoFinalidad>> {
    return this.find<IModeloTipoFinalidad, IModeloTipoFinalidad>(`${this.endpointUrl}/${id}/modelotipofinalidades`, options);
  }

  /**
   * Muestra todos los modelos tipo de fase de modelo ejecución convocatoria
   * @param id modelo de ejecucion
   * @param options opciones de búsqueda.
   */
  findModeloTipoFaseModeloEjecucionConvocatoria(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoFase>> {
    return this.find<IModeloTipoFase, IModeloTipoFase>(`${this.endpointUrl}/${id}/modelotipofases/convocatoria`, options);
  }

  /**
   * Muestra todos los modelos tipo de fase de modelo ejecución proyecto
   * @param id modelo de ejecucion
   * @param options opciones de búsqueda.
   */
  findModeloTipoFaseModeloEjecucionProyecto(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoFase>> {
    return this.find<IModeloTipoFase, IModeloTipoFase>(`${this.endpointUrl}/${id}/modelotipofases/proyecto`, options);
  }


  /**
   * Muestra todos los modelos tipo de fase del modelo de ejecución
   * @param id modelo de ejecucion
   * @param options opciones de búsqueda.
   */
  findModeloTipoFaseModeloEjecucion(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoFase>> {
    return this.find<IModeloTipoFase, IModeloTipoFase>(`${this.endpointUrl}/${id}/modelotipofases`, options);
  }


  /**
   * Muestra todos los modelos tipo de documento
   * @param id modelo de ejecucion
   * @param options opciones de búsqueda.
   */
  findModeloTipoDocumento(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoDocumento>> {
    return this.find<IModeloTipoDocumento, IModeloTipoDocumento>(`${this.endpointUrl}/${id}/modelotipodocumentos`, options);
  }

  findModeloTipoHito(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoHito>> {
    return this.find<IModeloTipoHito, IModeloTipoHito>(`${this.endpointUrl}/${id}/modelotipohitos`, options);
  }

  /**
  * Muestra los tipo de hitos de solicitudes para un modelo de ejecución concreto
  * @param id modelo de ejecucion
  * @param options opciones de búsqueda.
  */
  findModeloTipoHitoSolicitud(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoHito>> {
    return this.find<IModeloTipoHito, IModeloTipoHito>(`${this.endpointUrl}/${id}/modelotipohitos/solicitud`, options);
  }

  /**
  * Muestra los tipo de hitos de convocatorias para un modelo de ejecución concreto
  * @param id modelo de ejecucion
  * @param options opciones de búsqueda.
  */
  findModeloTipoHitoConvocatoria(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoHito>> {
    return this.find<IModeloTipoHito, IModeloTipoHito>(`${this.endpointUrl}/${id}/modelotipohitos/convocatoria`, options);
  }

  /**
  * Muestra los tipo de hitos de proyectos para un modelo de ejecución concreto
  * @param id modelo de ejecucion
  * @param options opciones de búsqueda.
  */
  findModeloTipoHitoProyecto(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloTipoHito>> {
    return this.find<IModeloTipoHito, IModeloTipoHito>(`${this.endpointUrl}/${id}/modelotipohitos/proyecto`, options);
  }

  /**
   * Encuentra unidades de gestion
   */
  findModeloTipoUnidadGestion(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloUnidad>> {
    return this.find<IModeloUnidadBackend, IModeloUnidad>(`${this.endpointUrl}/${id}/modelounidades`,
      options, ModeloUnidadService.CONVERTER);
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findAllTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloEjecucion>> {
    return this.find<IModeloEjecucion, IModeloEjecucion>(`${this.endpointUrl}/todos`, options);
  }

  /**
   * Desactivar modelo ejecucion
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, undefined);
  }

  /**
   * Reactivar modelo ejecucion
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, undefined);
  }


}
