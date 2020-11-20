import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IComentario } from '@core/models/eti/comentario';
import { IEvaluacionSolicitante } from '@core/models/eti/evaluacion-solicitante';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService extends SgiRestService<number, IEvaluacion>{
  private static readonly MAPPING = '/evaluaciones';
  private static readonly CONVERTER_EVALUACIONES_SOLICITANTES = new class extends SgiBaseConverter<IEvaluacion, IEvaluacionSolicitante> {
    toTarget(value: IEvaluacion): IEvaluacionSolicitante {
      return {
        id: value.id,
        memoria: value.memoria,
        comite: value.comite,
        convocatoriaReunion: value.convocatoriaReunion,
        tipoEvaluacion: value.tipoEvaluacion,
        version: value.version,
        dictamen: value.dictamen,
        fechaDictamen: value.fechaDictamen,
        esRevMinima: value.esRevMinima,
        activo: value.activo,
        persona: null,
        evaluador1: value.evaluador1,
        evaluador2: value.evaluador2,
        eliminable: value.eliminable
      };
    }
    fromTarget(value: IEvaluacionSolicitante): IEvaluacion {
      return {
        id: value.id,
        memoria: value.memoria,
        comite: value.comite,
        convocatoriaReunion: value.convocatoriaReunion,
        tipoEvaluacion: value.tipoEvaluacion,
        version: value.version,
        dictamen: value.dictamen,
        fechaDictamen: value.fechaDictamen,
        esRevMinima: value.esRevMinima,
        activo: value.activo,
        evaluador1: value.evaluador1,
        evaluador2: value.evaluador2,
        eliminable: value.eliminable
      };
    }
  }();

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(EvaluacionService.name, logger, `${environment.serviceServers.eti}${EvaluacionService.MAPPING}`, http);
  }

  /**
   * Devuelve todos las evaluaciones por convocatoria id.
   *
   * @param convocatoriaId id convocatoria.
   */
  findAllByConvocatoriaReunionId(convocatoriaId: number): Observable<SgiRestListResult<IEvaluacion>> {
    this.logger.debug(EvaluacionService.name, `findAllByConvocatoriaReunionId(${convocatoriaId})`, '-', 'start');
    return this.find<IEvaluacion, IEvaluacion>(`${this.endpointUrl}/convocatoriareuniones/${convocatoriaId}`, null).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `findAllByConvocatoriaReunionId(${convocatoriaId})`, '-', 'end'))
    );
  }

  /**
   * Devuelve los comentarios de tipo GESTOR de una evalución
   *
   * @param id Id de la evaluación
   * @param options Opciones de paginación
   */
  getComentariosGestor(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IComentario>> {
    this.logger.debug(EvaluacionService.name, `getComentariosGestor(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IComentario, IComentario>(`${this.endpointUrl}/${id}/comentarios-gestor`, options).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `getComentariosGestor(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
    );
  }

  /**
   * Devuelve los comentarios de tipo EVALUADOR de una evalución
   *
   * @param id Id de la evaluación
   * @param options Opciones de paginación
   */
  getComentariosEvaluador(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IComentario>> {
    this.logger.debug(EvaluacionService.name, `getComentariosEvaluador(${id}, ${options ?
      JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IComentario, IComentario>(`${this.endpointUrl}/${id}/comentarios-evaluador`, options).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `getComentariosEvaluador(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
    );
  }



  /**
   * Añade un comentario de tipo GESTOR a una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a crear
   */
  createComentarioGestor(id: number, comentario: IComentario): Observable<IComentario> {
    this.logger.debug(EvaluacionService.name, `createComentarioGestor(${id}, ${comentario})`, '-', 'start');
    return this.http.post<IComentario>(`${this.endpointUrl}/${id}/comentario-gestor`, comentario).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `createComentarioGestor(${id}, ${comentario})`, '-', 'end'))
    );
  }

  /**
   * Añade un comentario de tipo EVALUADOR a una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a crear
   */
  createComentarioEvaluador(id: number, comentario: IComentario): Observable<IComentario> {
    this.logger.debug(EvaluacionService.name, `createComentarioEvaluador(${id}, ${comentario})`, '-', 'start');
    return this.http.post<IComentario>(`${this.endpointUrl}/${id}/comentario-evaluador`, comentario).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `createComentarioEvaluador(${id}, ${comentario})`, '-', 'end'))
    );
  }

  /**
   * Actualiza un comentario de tipo GESTOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a actualizar
   * @param idComentario Id del Comentario
   */
  updateComentarioGestor(id: number, comentario: IComentario, idComentario: number): Observable<IComentario> {
    this.logger.debug(EvaluacionService.name, `updateComentarioGestor(${id}, ${comentario}, ${idComentario})`, '-', 'start');
    return this.http.put<IComentario>(`${this.endpointUrl}/${id}/comentario-gestor/${idComentario}`, comentario).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `updateComentarioGestor(${id}, ${comentario}, ${idComentario})`, '-', 'end'))
    );
  }

  /**
   * Actualiza un comentario de tipo EVALUADOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a actualizar
   * @param idComentario Id del Comentario
   */
  updateComentarioEvaluador(id: number, comentario: IComentario, idComentario: number): Observable<IComentario> {
    this.logger.debug(EvaluacionService.name, `updateComentarioEvaluador(${id}, ${comentario}, ${idComentario})`, '-', 'start');
    return this.http.put<IComentario>(`${this.endpointUrl}/${id}/comentario-evaluador/${idComentario}`, comentario).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `updateComentarioEvaluador(${id}, ${comentario}, ${idComentario})`, '-', 'end'))
    );
  }

  /**
   * Elimina un comentario de tipo GESTOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param idComentario Id del comentario
   */
  deleteComentarioGestor(id: number, idComentario: number): Observable<void> {
    this.logger.debug(EvaluacionService.name, `deleteComentarioGestor(${id}, ${idComentario})`, '-', 'start');
    const params = new HttpParams().set('idComentario', idComentario.toString());
    return this.http.delete<void>(`${this.endpointUrl}/${id}/comentario-gestor/${idComentario}`, { params }).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `deleteComentarioGestor(${id}, ${idComentario})`, '-', 'end'))
    );
  }

  /**
   * Elimina un comentario de tipo EVALUADOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param idComentario Id del comentario
   */
  deleteComentarioEvaluador(id: number, idComentario: number): Observable<void> {
    this.logger.debug(EvaluacionService.name, `deleteComentarioEvaluador(${id}, ${idComentario})`, '-', 'start');
    const params = new HttpParams().set('idComentario', idComentario.toString());
    return this.http.delete<void>(`${this.endpointUrl}/${id}/comentario-evaluador/${idComentario}`, { params }).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `deleteComentarioEvaluador(${id}, ${idComentario})`, '-', 'end'))
    );
  }

  /**
   * Por un lado devuelve las evaluaciones de tipo Memoria, con las memorias en estado "En Evaluacion" o "En secretaría revisión mínima",
   * y por otro, las evaluaciones de tipo Retrospectiva cuya memoria tenga en estado de la retrospectiva "En Evaluacion",
   * ambas en su última versión (que serán las que no estén evaluadas).
   * @param options SgiRestFindOptions.
   */
  findAllByMemoriaAndRetrospectivaEnEvaluacion(options?: SgiRestFindOptions): Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    this.logger.debug(EvaluacionService.name, `findAllByMemoriaAndRetrospectivaEnEvaluacion
    (${options ? JSON.stringify(options) : ''})`, '-', 'START');
    return this.find<IEvaluacion, IEvaluacionSolicitante>(`${environment.serviceServers.eti}${EvaluacionService.MAPPING}/evaluables`,
      options, EvaluacionService.CONVERTER_EVALUACIONES_SOLICITANTES).pipe(
        tap(() => {
          this.logger.debug(EvaluacionService.name, `findAllByMemoriaAndRetrospectivaEnEvaluacion(${options ? JSON.stringify(options) : ''})`, '-', 'END');
        }));
  }

  /**
   * Devuelve todos las evaluaciones de la convocatoria que no son revisión mínima.
   *
   * @param idConvocatoria id convocatoria.
   * @param options opcione de busqueda.
   * @return las evaluaciones de la convocatoria.
   */
  findAllByConvocatoriaReunionIdAndNoEsRevMinima(idConvocatoria: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IEvaluacion>> {
    this.logger.debug(EvaluacionService.name, `findAllByConvocatoriaReunionIdAndNoEsRevMinima(${idConvocatoria})`, '-', 'START');
    return this.find<IEvaluacion, IEvaluacion>(`${this.endpointUrl}/convocatoriareunionnorevminima/${idConvocatoria}`, options).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `findAllByConvocatoriaReunionIdAndNoEsRevMinima(${idConvocatoria})`, '-', 'END'))
    );
  }

  /**
   * Devuelve todos las memorias de evaluación que tengan determinados estados.
   *
   * @param options opciones de búsqueda.
   * @return las evaluaciones
   */

  findSeguimientoMemoria(options?: SgiRestFindOptions): Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    this.logger.debug(EvaluacionService.name, `findSeguimientoMemoria
    (${options ? JSON.stringify(options) : ''})`, '-', 'START');
    return this.find<IEvaluacion, IEvaluacionSolicitante>(`${environment.serviceServers.eti}${EvaluacionService.MAPPING}/memorias-seguimiento-final`,
      options, EvaluacionService.CONVERTER_EVALUACIONES_SOLICITANTES).pipe(
        tap(() => {
          this.logger.debug(EvaluacionService.name, `findSeguimientoMemoria(${options ? JSON.stringify(options) : ''})`, '-', 'END');
        }));
  }

  /**
   * Devuelve el número de comentarios de una evalución
   *
   * @param id Id de la evaluación
   */
  getNumComentariosEvaluacion(id: number): Observable<SgiRestListResult<number>> {
    this.logger.debug(EvaluacionService.name, `getNumComentariosEvaluacion(${id})`, '-', 'start');
    return this.find<number, number>(`${this.endpointUrl}/${id}/numero-comentarios`).pipe(
      tap(() => this.logger.debug(EvaluacionService.name, `getNumComentariosEvaluacion(${id})`, '-', 'end'))
    );
  }

}
