import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IEvaluacionWithNumComentario } from '@core/models/eti/evaluacion-with-num-comentarios';
import { IInforme } from '@core/models/eti/informe';
import { IMemoria } from '@core/models/eti/memoria';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MemoriaService extends SgiRestService<number, IMemoria>{

  private static readonly MAPPING = '/memorias';

  constructor(private readonly logger: NGXLogger, protected http: HttpClient) {
    super(MemoriaService.name, `${environment.serviceServers.eti}${MemoriaService.MAPPING}`, http);
  }

  /**
   * Devuelve toda la documentación asociada a una memoria.
   *
   * @param id id de la memoria.
   */
  getDocumentaciones(
    idMemoria: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${idMemoria}/documentaciones`, options);
  }

  /**
   * Devuelve toda la documentación asociada a una memoria según el tipo de la Evaluación
   *
   * @param id id de la memoria.
   * @param idTipoEvaluacion id del tipo de la evaluación.
   */
  getDocumentacionesTipoEvaluacion(
    idMemoria: number, idTipoEvaluacion: number,
    options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${idMemoria}/documentaciones/${idTipoEvaluacion}`, options);
  }

  /**
   * Devuelve todas las evaluaciones de una memoria.
   *
   * @param memoriaId id de la memoria.
   * @param evaluacionId id de la evaluacion.
   */
  getEvaluacionesAnteriores(memoriaId: number, evaluacionId: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IEvaluacionWithNumComentario>> {
    return this.find<IEvaluacionWithNumComentario, IEvaluacionWithNumComentario>
      (`${this.endpointUrl}/${memoriaId}/evaluaciones-anteriores/${evaluacionId}`, options);
  }

  /**
   * Devuelve todos las memorias asignables a la convocatoria
   *
   * @param idConvocatoria id convocatoria.
   * @param options opciones de busqueda.
   * @return las memorias asignables a la convocatoria.
   */
  findAllMemoriasAsignablesConvocatoria(idConvocatoria: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoria>> {
    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/asignables/${idConvocatoria}`, options);
  }

  /**
   * Devuelve todos las memorias asignables para una convocatoria de tipo seguimiento
   *
   * @param options opciones de busqueda.
   * @return las memorias asignables a la convocatoria de ese tipo seguimiento.
   */
  findAllAsignablesTipoConvocatoriaSeguimiento(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoria>> {
    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/tipo-convocatoria-seg`, options);
  }


  /**
   * Devuelve todos las memorias asignables para una convocatoria de tipo ordinaria / extraordinaria
   *
   * @param options opciones de busqueda.
   * @return las memorias asignables a la convocatoria de tipo ordinaria / extraordinaria.
   *
   */
  findAllAsignablesTipoConvocatoriaOrdExt(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoria>> {
    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/tipo-convocatoria-ord-ext`, options);
  }

  /**
   * Devuelve todas las memorias de una persona en la que es creador de la petición de evaluación
   *  o responsable de una memoria
   * @param options opciones de búsqueda
   * @return las memorias
   */
  findAllMemoriasEvaluacionByPersonaRef(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoriaPeticionEvaluacion>> {
    return this.find<IMemoriaPeticionEvaluacion, IMemoriaPeticionEvaluacion>(`${this.endpointUrl}/persona`, options);
  }

  findAll(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoriaPeticionEvaluacion>> {
    return this.find<IMemoriaPeticionEvaluacion, IMemoriaPeticionEvaluacion>(`${this.endpointUrl}`, options);
  }
  /**
   * Devuelve toda la documentación por tipo de formulario de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionFormulario(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-formulario`, options);
  }


  /**
   * Devuelve toda la documentación por tipo de seguimiento anual de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionSeguimientoAnual(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-seguimiento-anual`, options);
  }


  /**
   * Devuelve toda la documentación por tipo de seguimiento final de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionSeguimientoFinal(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-seguimiento-final`, options);
  }


  /**
   * Devuelve toda la documentación por tipo de retrospectiva de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionRetrospectiva(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-retrospectiva`, options);
  }


  createDocumentacionInicial(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-inicial`, documentacionMemoria);

  }

  createDocumentacionSeguimientoAnual(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-seguimiento-anual`, documentacionMemoria);

  }

  createDocumentacionSeguimientoFinal(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-seguimiento-final`, documentacionMemoria);
  }

  createDocumentacionRetrospectiva(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-retrospectiva`, documentacionMemoria);

  }

  /**
   * Elimina el documento inicial de una memoria.
   *
   * @param idMemoria Identifiacdor de la memoria.
   * @param idDocumentacionMemoria Identificador del documento memoria.
   *
   * @returns observable para eliminar documentación de seguimiento anual.
   */
  deleteDocumentacionInicial(idMemoria: number, idDocumentacionMemoria: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-inicial/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      })
    );
  }

  updateDocumentacion(
    id: number, documentacionMemoria: IDocumentacionMemoria, idDocumentacionMemoria: number): Observable<IDocumentacionMemoria> {
    return this.http.put<IDocumentacionMemoria>
      (`${this.endpointUrl}/${id}/documentacion-inicial/${idDocumentacionMemoria}`, documentacionMemoria);
  }


  /**
   * Devuelve todos las evaluaciones de una memoria id.
   *
   * @param memoriaId id memoria.
   */
  getEvaluacionesMemoria(memoriaId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IEvaluacion>> {
    return this.find<IEvaluacion, IEvaluacion>(`${this.endpointUrl}/${memoriaId}/evaluaciones`, options);
  }

  /**
   *  Devuelve los informes enviados a secretaría para su evaluación
   * @param id identificador de la memoria
   * @return listado de informes.
   */
  findInformesSecretaria(id: number): Observable<SgiRestListResult<IInforme>> {
    return this.find<IInforme, IInforme>(`${this.endpointUrl}/${id}/informes`);
  }

  /**
   * Elimina el documento de tipo seguimiento anual de una memoria.
   *
   * @param idMemoria Identifiacdor de la memoria.
   * @param idDocumentacionMemoria Identificador del documento memoria.
   *
   * @returns observable para eliminar documentación de seguimiento anual.
   */
  deleteDocumentacionSeguimientoAnual(idMemoria: number, idDocumentacionMemoria: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-seguimiento-anual/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      })
    );
  }

  /**
   * Elimina el documento de tipo seguimiento final de una memoria.
   *
   * @param idMemoria Identifiacdor de la memoria.
   * @param idDocumentacionMemoria Identificador del documento memoria.
   *
   * @returns observable para eliminar documentación de seguimiento final.
   */
  deleteDocumentacionSeguimientoFinal(idMemoria: number, idDocumentacionMemoria: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-seguimiento-final/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      })
    );
  }

  /**
   * Elimina el documento de tipo retrospectiva de una memoria.
   *
   * @param idMemoria Identifiacdor de la memoria.
   * @param idDocumentacionMemoria Identificador del documento memoria.
   *
   * @returns observable para eliminar documentación de retrospectiva.
   */
  deleteDocumentacionRetrospectiva(idMemoria: number, idDocumentacionMemoria: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-retrospectiva/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      })
    );
  }

  /**
   * Recupera el estado anterior de la memoria
   * @param id identificador de la memoria
   */
  recuperarEstadoAnterior(id: number): Observable<IMemoria> {
    return this.http.get<IMemoria>(`${this.endpointUrl}/${id}/recuperar-estado-anterior`);
  }

  /**
   * Se cambia el estado de la memoria a Enviar Secretaría o Enviar Secretaría Revisión Mínima
   *
   * @param memoriaId id memoria.
   */
  enviarSecretaria(memoriaId: number): Observable<void> {
    return this.http.put<void>(`${this.endpointUrl}/${memoriaId}/enviar-secretaria`, null);
  }

  /**
   * Se cambia el estado de la Retrospectiva a 'En secretaría'
   *
   * @param memoriaId id memoria.
   */
  enviarSecretariaRetrospectiva(memoriaId: number): Observable<void> {
    return this.http.put<void>(`${this.endpointUrl}/${memoriaId}/enviar-secretaria-retrospectiva`, null);
  }

  /**
   * Crea una memoria del tipo modificada enviando el id de la memoria de la que se realizará la copia de datos.
   * @param memoria memoria a crear.
   * @param id identificador de la memoria de la que se parte para crear la nueva memoria.
   */
  createMemoriaModificada(memoria: IMemoria, id: number): Observable<IMemoria> {
    return this.http.post<IMemoria>(`${this.endpointUrl}/${id}/crear-memoria-modificada`, memoria);
  }

}
