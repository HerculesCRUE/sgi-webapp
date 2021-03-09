import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { ITarea } from '@core/models/eti/tarea';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PeticionEvaluacionService extends SgiRestService<number, IPeticionEvaluacion> {
  private static readonly MAPPING = '/peticionevaluaciones';

  constructor(private readonly logger: NGXLogger, protected http: HttpClient) {
    super(
      PeticionEvaluacionService.name,
      `${environment.serviceServers.eti}${PeticionEvaluacionService.MAPPING}`,
      http
    );
  }

  /**
   * Devuelve los equipos de trabajo de la PeticionEvaluacion.
   *
   * @param idPeticionEvaluacion id de la peticion de evaluacion.
   * @return los equipos de trabajo de la PeticionEvaluacion.
   */
  findEquipoInvestigador(idPeticionEvaluacion: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IEquipoTrabajo>> {
    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/equipo-investigador`;
    return this.find<IEquipoTrabajo, IEquipoTrabajo>(endpointUrl, options);
  }

  /**
   * Devuelve las tareas de la PeticionEvaluacion.
   *
   * @param idPeticionEvaluacion id de la peticion de evaluacion.
   * @return las tareas de la PeticionEvaluacion.
   */
  findTareas(idPeticionEvaluacion: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ITarea>> {
    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/tareas`;
    return this.find<ITarea, ITarea>(endpointUrl, options);
  }

  /**
   * Devuelve las memorias de la PeticionEvaluacion.
   *
   * @param idPeticionEvaluacion id de la peticion de evaluacion.
   * @return las memorias de la PeticionEvaluacion.
   */
  findMemorias(idPeticionEvaluacion: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IMemoriaPeticionEvaluacion>> {
    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/memorias`;
    return this.find<IMemoriaPeticionEvaluacion, IMemoriaPeticionEvaluacion>(endpointUrl, options);
  }

  /**
   * Create the element and return the persisted value
   *
   * @param idPeticionEvaluacion Identifiacdor de la peticion evaluacion.
   * @param equipoTrabajo El nuevo equipo de trabajo
   *
   * @returns observable para crear el equipo trabajo.
   */
  createEquipoTrabajo(idPeticionEvaluacion: number, equipoTrabajo: IEquipoTrabajo): Observable<IEquipoTrabajo> {
    return this.http.post<IEquipoTrabajo>(`${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo`, equipoTrabajo).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      })
    );
  }

  /**
   * Create the element and return the persisted value
   *
   * @param idPeticionEvaluacion Identifiacdor de la peticion evaluacion.
   * @param idEquipoTrabajo Identificador del equipo trabajo.
   * @param tarea La nueva tarea
   *
   * @returns observable para crear la tarea.
   */
  createTarea(idPeticionEvaluacion: number, idEquipoTrabajo: number, tarea: ITarea): Observable<ITarea> {
    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo/${idEquipoTrabajo}/tareas`;
    return this.http.post<ITarea>(endpointUrl, tarea)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.logger.error(error);
          return throwError(error);
        })
      );
  }

  /**
   * Elimina el equipo de trabajo de la peticion de evaluación.
   *
   * @param idPeticionEvaluacion Identifiacdor de la peticion evaluacion.
   * @param idEquipoTrabajo Identificador del equipo trabajo.
   *
   * @returns observable para eliminar el equipo trabajo.
   */
  deleteEquipoTrabajoPeticionEvaluacion(idPeticionEvaluacion: number, idEquipoTrabajo: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo/${idEquipoTrabajo}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      })
    );
  }

  /**
   * Elimina la tarea de un equipo de trabajo de la peticion de evaluación.
   *
   * @param idPeticionEvaluacion Identifiacdor de la peticion evaluacion.
   * @param idEquipoTrabajo Identifiacdor del equipo de trabajo.
   * @param idTarea Identificador de la tarea.
   *
   * @returns observable para eliminar la tarea.
   */
  deleteTareaPeticionEvaluacion(idPeticionEvaluacion: number, idEquipoTrabajo: number, idTarea: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo/${idEquipoTrabajo}/tareas/${idTarea}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(error);
        return throwError(error);
      })
    );
  }

  /**
   * Devuelve todas las peticiones de evaluación de una persona en la que es creador de la petición de evaluación
   *  o responsable de una memoria
   * @param options opciones de búsqueda
   * @return las peticiones de evaluación
   */
  findAllPeticionEvaluacionMemoria(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IPeticionEvaluacion>> {
    return this.find<IPeticionEvaluacion, IPeticionEvaluacion>(`${this.endpointUrl}/memorias`, options);
  }
}
