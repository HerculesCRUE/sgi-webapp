import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IComentario } from '@core/models/eti/comentario';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IEvaluacionSolicitante } from '@core/models/eti/evaluacion-solicitante';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

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

  constructor(protected http: HttpClient) {
    super(EvaluacionService.name, `${environment.serviceServers.eti}${EvaluacionService.MAPPING}`, http);
  }

  /**
   * Devuelve todos las evaluaciones por convocatoria id.
   *
   * @param convocatoriaId id convocatoria.
   */
  findAllByConvocatoriaReunionId(convocatoriaId: number): Observable<SgiRestListResult<IEvaluacion>> {
    return this.find<IEvaluacion, IEvaluacion>(`${this.endpointUrl}/convocatoriareuniones/${convocatoriaId}`, null);
  }

  /**
   * Devuelve los comentarios de tipo GESTOR de una evalución
   *
   * @param id Id de la evaluación
   * @param options Opciones de paginación
   */
  getComentariosGestor(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IComentario>> {
    return this.find<IComentario, IComentario>(`${this.endpointUrl}/${id}/comentarios-gestor`, options);
  }

  /**
   * Devuelve los comentarios de tipo EVALUADOR de una evalución
   *
   * @param id Id de la evaluación
   * @param options Opciones de paginación
   */
  getComentariosEvaluador(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IComentario>> {
    return this.find<IComentario, IComentario>(`${this.endpointUrl}/${id}/comentarios-evaluador`, options);
  }



  /**
   * Añade un comentario de tipo GESTOR a una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a crear
   */
  createComentarioGestor(id: number, comentario: IComentario): Observable<IComentario> {
    return this.http.post<IComentario>(`${this.endpointUrl}/${id}/comentario-gestor`, comentario);
  }

  /**
   * Añade un comentario de tipo EVALUADOR a una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a crear
   */
  createComentarioEvaluador(id: number, comentario: IComentario): Observable<IComentario> {
    return this.http.post<IComentario>(`${this.endpointUrl}/${id}/comentario-evaluador`, comentario);
  }

  /**
   * Actualiza un comentario de tipo GESTOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a actualizar
   * @param idComentario Id del Comentario
   */
  updateComentarioGestor(id: number, comentario: IComentario, idComentario: number): Observable<IComentario> {
    return this.http.put<IComentario>(`${this.endpointUrl}/${id}/comentario-gestor/${idComentario}`, comentario);
  }

  /**
   * Actualiza un comentario de tipo EVALUADOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param comentario Comentario a actualizar
   * @param idComentario Id del Comentario
   */
  updateComentarioEvaluador(id: number, comentario: IComentario, idComentario: number): Observable<IComentario> {
    return this.http.put<IComentario>(`${this.endpointUrl}/${id}/comentario-evaluador/${idComentario}`, comentario);
  }

  /**
   * Elimina un comentario de tipo GESTOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param idComentario Id del comentario
   */
  deleteComentarioGestor(id: number, idComentario: number): Observable<void> {
    const params = new HttpParams().set('idComentario', idComentario.toString());
    return this.http.delete<void>(`${this.endpointUrl}/${id}/comentario-gestor/${idComentario}`, { params });
  }

  /**
   * Elimina un comentario de tipo EVALUADOR de una evaluación
   *
   * @param id Id de la evaluación
   * @param idComentario Id del comentario
   */
  deleteComentarioEvaluador(id: number, idComentario: number): Observable<void> {
    const params = new HttpParams().set('idComentario', idComentario.toString());
    return this.http.delete<void>(`${this.endpointUrl}/${id}/comentario-evaluador/${idComentario}`, { params });
  }

  /**
   * Por un lado devuelve las evaluaciones de tipo Memoria, con las memorias en estado "En Evaluacion" o "En secretaría revisión mínima",
   * y por otro, las evaluaciones de tipo Retrospectiva cuya memoria tenga en estado de la retrospectiva "En Evaluacion",
   * ambas en su última versión (que serán las que no estén evaluadas).
   * @param options SgiRestFindOptions.
   */
  findAllByMemoriaAndRetrospectivaEnEvaluacion(options?: SgiRestFindOptions): Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    return this.find<IEvaluacion, IEvaluacionSolicitante>(`${environment.serviceServers.eti}${EvaluacionService.MAPPING}/evaluables`,
      options, EvaluacionService.CONVERTER_EVALUACIONES_SOLICITANTES);
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
    return this.find<IEvaluacion, IEvaluacion>(`${this.endpointUrl}/convocatoriareunionnorevminima/${idConvocatoria}`, options);
  }

  /**
   * Devuelve todos las memorias de evaluación que tengan determinados estados.
   *
   * @param options opciones de búsqueda.
   * @return las evaluaciones
   */

  findSeguimientoMemoria(options?: SgiRestFindOptions): Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    return this.find<IEvaluacion, IEvaluacionSolicitante>(`${environment.serviceServers.eti}${EvaluacionService.MAPPING}/memorias-seguimiento-final`,
      options, EvaluacionService.CONVERTER_EVALUACIONES_SOLICITANTES);
  }

  /**
   * Devuelve el número de comentarios de una evalución
   *
   * @param id Id de la evaluación
   */
  getNumComentariosEvaluacion(id: number): Observable<SgiRestListResult<number>> {
    return this.find<number, number>(`${this.endpointUrl}/${id}/numero-comentarios`);
  }

}
