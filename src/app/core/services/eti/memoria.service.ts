import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { IEvaluacionWithNumComentario } from '@core/models/eti/evaluacion-with-num-comentarios';
import { IMemoria } from '@core/models/eti/memoria';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IInforme } from '@core/models/eti/informe';

@Injectable({
  providedIn: 'root'
})
export class MemoriaService extends SgiRestService<number, IMemoria>{

  private static readonly MAPPING = '/memorias';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(MemoriaService.name, logger, `${environment.serviceServers.eti}${MemoriaService.MAPPING}`, http);
  }

  /**
   * Devuelve toda la documentación asociada a una memoria.
   *
   * @param id id de la memoria.
   */
  getDocumentaciones(
    idMemoria: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    this.logger.debug(MemoriaService.name, `getDocumentaciones(${idMemoria}, ${options ? JSON.stringify(options) : options})`, 'start');
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${idMemoria}/documentaciones`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name,
          `getDocumentaciones(${idMemoria},  ${options ? JSON.stringify(options) : options})`, 'end'))
      );
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
    this.logger.debug(MemoriaService.name, `getDocumentacionesTipoEvaluacion(${idMemoria},${idTipoEvaluacion}, ${options ? JSON.stringify(options) : options})`, 'start');
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${idMemoria}/documentaciones/${idTipoEvaluacion}`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name,
          `getDocumentacionesTipoEvaluacion(${idMemoria}, ${idTipoEvaluacion}, ${options ? JSON.stringify(options) : options})`, 'end'))
      );
  }

  /**
   * Devuelve todas las evaluaciones de una memoria.
   *
   * @param memoriaId id de la memoria.
   * @param evaluacionId id de la evaluacion.
   */
  getEvaluacionesAnteriores(memoriaId: number, evaluacionId: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IEvaluacionWithNumComentario>> {
    this.logger.debug(MemoriaService.name,
      `getEvaluacionesAnteriores(${memoriaId}, ${evaluacionId}, ${options ? JSON.stringify(options) : options})`, '-', 'start');
    return this.find<IEvaluacionWithNumComentario, IEvaluacionWithNumComentario>
      (`${this.endpointUrl}/${memoriaId}/evaluaciones-anteriores/${evaluacionId}`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name,
          `getEvaluacionesAnteriores(${memoriaId}, ${evaluacionId}, ${options ? JSON.stringify(options) : options})`, '-', 'end'))
      );
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
    this.logger.debug(MemoriaService.name, `findAllMemoriasAsignablesConvocatoria(${idConvocatoria})`, '-', 'START');
    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/asignables/${idConvocatoria}`, options).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `findAllMemoriasAsignablesConvocatoria(${idConvocatoria})`, '-', 'END'))
    );
  }

  /**
   * Devuelve todos las memorias asignables para una convocatoria de tipo seguimiento
   *
   * @param options opciones de busqueda.
   * @return las memorias asignables a la convocatoria de ese tipo seguimiento.
   */
  findAllAsignablesTipoConvocatoriaSeguimiento(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoria>> {
    this.logger.debug(MemoriaService.name, `findAllAsignablesTipoConvocatoriaSeguimiento()`, '-', 'START');
    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/tipo-convocatoria-seg`, options).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `findAllAsignablesTipoConvocatoriaSeguimiento()`, '-', 'END'))
    );
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
    this.logger.debug(MemoriaService.name, `findAllAsignablesTipoConvocatoriaOrdExt()`, '-', 'START');
    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/tipo-convocatoria-ord-ext`, options).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `findAllAsignablesTipoConvocatoriaOrdExt()`, '-', 'END'))
    );
  }

  findAllByPersonaRef(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoria>> {
    this.logger.debug(MemoriaService.name, `findAllByPersonaRef()`, '-', 'START');
    return this.find<IMemoria, IMemoria>(`${this.endpointUrl}/persona`, options).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `findAllByPersonaRef()`, '-', 'END'))
    );
  }

  findAll(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoriaPeticionEvaluacion>> {
    this.logger.debug(MemoriaService.name, `findAll()`, '-', 'START');
    return this.find<IMemoriaPeticionEvaluacion, IMemoriaPeticionEvaluacion>(`${this.endpointUrl}`, options).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `findAll()`, '-', 'END'))
    );
  }
  /**
   * Devuelve toda la documentación por tipo de formulario de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionFormulario(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    this.logger.debug(MemoriaService.name, `findDocumentacionFormulario(${id}, ${options ? JSON.stringify(options) : options})`, 'start');
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-formulario`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name,
          `findDocumentacionFormulario(${id}, ${options ? JSON.stringify(options) : options})`, 'end'))
      );
  }


  /**
   * Devuelve toda la documentación por tipo de seguimiento anual de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionSeguimientoAnual(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    this.logger.debug(MemoriaService.name, `findDocumentacionSeguimientoAnual(${id}, ${options ? JSON.stringify(options) : options})`, 'start');
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-seguimiento-anual`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name,
          `findDocumentacionSeguimientoAnual(${id}, ${options ? JSON.stringify(options) : options})`, 'end'))
      );
  }


  /**
   * Devuelve toda la documentación por tipo de seguimiento final de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionSeguimientoFinal(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    this.logger.debug(MemoriaService.name, `findDocumentacionSeguimientoFinal(${id}, ${options ? JSON.stringify(options) : options})`, 'start');
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-seguimiento-final`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name,
          `findDocumentacionSeguimientoFinal(${id}, ${options ? JSON.stringify(options) : options})`, 'end'))
      );
  }


  /**
   * Devuelve toda la documentación por tipo de retrospectiva de una memoria.
   *
   * @param id id de la memoria.
   */
  findDocumentacionRetrospectiva(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    this.logger.debug(MemoriaService.name,
      `findDocumentacionRetrospectiva(${id}, ${options ? JSON.stringify(options) : options})`, 'start');
    return this.find<IDocumentacionMemoria, IDocumentacionMemoria>(
      `${this.endpointUrl}/${id}/documentacion-retrospectiva`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name,
          `findDocumentacionRetrospectiva(${id}, ${options ? JSON.stringify(options) : options})`, 'end'))
      );
  }


  createDocumentacionInicial(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    this.logger.debug(MemoriaService.name, `createDocumentacionInicial(${id}, ${documentacionMemoria})`, '-', 'start');
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-inicial`, documentacionMemoria).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `createDocumentacionInicial(${id}, ${documentacionMemoria})`, '-', 'end'))
    );

  }

  createDocumentacionSeguimientoAnual(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    this.logger.debug(MemoriaService.name, `createDocumentacionSeguimientoAnual(${id}, ${documentacionMemoria})`, '-', 'start');
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-seguimiento-anual`, documentacionMemoria).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `createDocumentacionSeguimientoAnual(${id}, ${documentacionMemoria})`, '-', 'end'))
    );

  }

  createDocumentacionSeguimientoFinal(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    this.logger.debug(MemoriaService.name, `createDocumentacionSeguimientoFinal(${id}, ${documentacionMemoria})`, '-', 'start');
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-seguimiento-final`, documentacionMemoria).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `createDocumentacionSeguimientoFinal(${id}, ${documentacionMemoria})`, '-', 'end'))
    );

  }

  createDocumentacionRetrospectiva(id: number, documentacionMemoria: IDocumentacionMemoria): Observable<IDocumentacionMemoria> {
    this.logger.debug(MemoriaService.name, `createDocumentacionRetrospectiva(${id}, ${documentacionMemoria})`, '-', 'start');
    return this.http.post<IDocumentacionMemoria>(`${this.endpointUrl}/${id}/documentacion-retrospectiva`, documentacionMemoria).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `createDocumentacionRetrospectiva(${id}, ${documentacionMemoria})`, '-', 'end'))
    );

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
    this.logger.debug(MemoriaService.name, `deleteDocumentacionInicial(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'START');
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-inicial/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(MemoriaService.name,
          `deleteDocumentacionInicial(${idMemoria}, ${idDocumentacionMemoria}):`, error);
        return throwError(error);
      }),

      tap(_ => {
        this.logger.debug(MemoriaService.name,
          `deleteDocumentacionInicial(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'END');
      })
    );
  }

  updateDocumentacion(
    id: number, documentacionMemoria: IDocumentacionMemoria, idDocumentacionMemoria: number): Observable<IDocumentacionMemoria> {
    this.logger.debug(MemoriaService.name, `updateDocumentacion(${id}, ${documentacionMemoria}, ${idDocumentacionMemoria})`, '-', 'start');
    return this.http.put<IDocumentacionMemoria>
      (`${this.endpointUrl}/${id}/documentacion-inicial/${idDocumentacionMemoria}`, documentacionMemoria).pipe(
        tap(() =>
          this.logger.debug(MemoriaService.name, `updateDocumentacion(${id}, ${documentacionMemoria}, ${idDocumentacionMemoria})`, '-', 'end'))
      );
  }


  /**
   * Devuelve todos las evaluaciones de una memoria id.
   *
   * @param memoriaId id memoria.
   */
  getEvaluacionesMemoria(memoriaId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IEvaluacion>> {
    this.logger.debug(MemoriaService.name, `getEvaluacionesMemoria(${memoriaId}, ${options ? JSON.stringify(options) : options})`, '-', 'start');
    return this.find<IEvaluacion, IEvaluacion>(`${this.endpointUrl}/${memoriaId}/evaluaciones`, options).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `getEvaluacionesMemoria(${memoriaId}, ${options ? JSON.stringify(options) : options})`, '-', 'end'))
    );
  }


  /**
   * Devuelve todos las memorias de responsable y creador a partir de una persona ref
   *
   * @param options opciones de busqueda.
   */
  findAllByPersonaRefPeticionEvaluacion(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IMemoriaPeticionEvaluacion>> {
    this.logger.debug(MemoriaService.name, `findAllByPersonaRefPeticionEvaluacion()`, '-', 'START');
    return this.find<IMemoriaPeticionEvaluacion, IMemoriaPeticionEvaluacion>(
      `${this.endpointUrl}/persona/peticion-evaluacion`, options).pipe(
        tap(() => this.logger.debug(MemoriaService.name, `findAllByPersonaRefPeticionEvaluacion()`, '-', 'END'))
      );
  }

  /**
   *  Devuelve los informes enviados a secretaría para su evaluación
   * @param id identificador de la memoria
   * @return listado de informes.
   */
  findInformesSecretaria(id: number): Observable<SgiRestListResult<IInforme>> {
    this.logger.debug(MemoriaService.name, `findInformesSecretaria()`, '-', 'start');
    return this.find<IInforme, IInforme>(`${this.endpointUrl}/${id}/informes`)
      .pipe(
        tap(() => {
          this.logger.debug(MemoriaService.name, `findInformesSecretaria()`, '-', 'end');
        })
      );
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
    this.logger.debug(MemoriaService.name, `deleteDocumentacionSeguimientoAnual(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'START');
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-seguimiento-anual/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(MemoriaService.name,
          `deleteDocumentacionSeguimientoAnual(${idMemoria}, ${idDocumentacionMemoria}):`, error);
        return throwError(error);
      }),

      tap(_ => {
        this.logger.debug(MemoriaService.name,
          `deleteDocumentacionSeguimientoAnual(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'END');
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
    this.logger.debug(MemoriaService.name, `deleteDocumentacionSeguimientoFinal(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'START');
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-seguimiento-final/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(MemoriaService.name,
          `deleteDocumentacionSeguimientoFinal(${idMemoria}, ${idDocumentacionMemoria}):`, error);
        return throwError(error);
      }),

      tap(_ => {
        this.logger.debug(MemoriaService.name,
          `deleteDocumentacionSeguimientoFinal(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'END');
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
    this.logger.debug(MemoriaService.name, `deleteDocumentacionRetrospectiva(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'START');
    return this.http.delete<void>(`${this.endpointUrl}/${idMemoria}/documentacion-retrospectiva/${idDocumentacionMemoria}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(MemoriaService.name,
          `deleteDocumentacionRetrospectiva(${idMemoria}, ${idDocumentacionMemoria}):`, error);
        return throwError(error);
      }),

      tap(_ => {
        this.logger.debug(MemoriaService.name,
          `deleteDocumentacionRetrospectiva(${idMemoria}, ${idDocumentacionMemoria})`, '-', 'END');
      })
    );
  }

  /**
   * Recupera el estado anterior de la memoria
   * @param id identificador de la memoria
   */
  recuperarEstadoAnterior(id: number): Observable<IMemoria> {
    this.logger.debug(MemoriaService.name, `recuperarEstadoAnterior(${id})`, '-', 'start');
    return this.http.get<IMemoria>(`${this.endpointUrl}/${id}/recuperar-estado-anterior`).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `recuperarEstadoAnterior(${id})`, '-', 'end'))
    );
  }

  /**
   * Se cambia el estado de la memoria a Enviar Secretaría o Enviar Secretaría Revisión Mínima
   *
   * @param memoriaId id memoria.
   */
  enviarSecretaria(memoriaId: number): Observable<void> {
    this.logger.debug(MemoriaService.name, `enviarSecretaria(${memoriaId})`, '-', 'start');
    return this.http.put<void>(`${this.endpointUrl}/${memoriaId}/enviar-secretaria`, null).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `enviarSecretaria(${memoriaId})`, '-', 'end'))
    );
  }

  /**
   * Se cambia el estado de la Retrospectiva a 'En secretaría'
   *
   * @param memoriaId id memoria.
   */
  enviarSecretariaRetrospectiva(memoriaId: number): Observable<void> {
    this.logger.debug(MemoriaService.name, `enviarSecretariaRetrospectiva(${memoriaId})`, '-', 'start');
    return this.http.put<void>(`${this.endpointUrl}/${memoriaId}/enviar-secretaria-retrospectiva`, null).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `enviarSecretariaRetrospectiva(${memoriaId})`, '-', 'end'))
    );
  }

  /**
   * Crea una memoria del tipo modificada enviando el id de la memoria de la que se realizará la copia de datos.
   * @param memoria memoria a crear.
   * @param id identificador de la memoria de la que se parte para crear la nueva memoria.
   */
  createMemoriaModificada(memoria: IMemoria, id: number): Observable<IMemoria> {
    this.logger.debug(MemoriaService.name, `createMemoriaModificada(${memoria}, ${id})`, '-', 'start');
    return this.http.post<IMemoria>(`${this.endpointUrl}/${id}/crear-memoria-modificada`, memoria).pipe(
      tap(() => this.logger.debug(MemoriaService.name, `createMemoriaModificada(${memoria}, ${id})`, '-', 'end'))
    );
  }

}
