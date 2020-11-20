import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { environment } from '@env';
import { NGXLogger } from 'ngx-logger';
import { SgiRestService, SgiRestListResult, SgiRestFindOptions } from '@sgi/framework/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';
import { ITarea } from '@core/models/eti/tarea';

@Injectable({
  providedIn: 'root'
})
export class PeticionEvaluacionService extends SgiRestService<number, IPeticionEvaluacion> {
  private static readonly MAPPING = '/peticionevaluaciones';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      PeticionEvaluacionService.name,
      logger,
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
    this.logger.debug(PeticionEvaluacionService.name, `findEquipoInvestigador(${idPeticionEvaluacion})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/equipo-investigador`;
    return this.find<IEquipoTrabajo, IEquipoTrabajo>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(PeticionEvaluacionService.name, `findEquipoInvestigador(${idPeticionEvaluacion})`, '-', 'end'))
      );
  }

  /**
   * Devuelve las tareas de la PeticionEvaluacion.
   *
   * @param idPeticionEvaluacion id de la peticion de evaluacion.
   * @return las tareas de la PeticionEvaluacion.
   */
  findTareas(idPeticionEvaluacion: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ITarea>> {
    this.logger.debug(PeticionEvaluacionService.name, `findTareas(${idPeticionEvaluacion})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/tareas`;
    return this.find<ITarea, ITarea>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(PeticionEvaluacionService.name, `findTareas(${idPeticionEvaluacion})`, '-', 'end'))
      );
  }

  /**
   * Devuelve las memorias de la PeticionEvaluacion.
   *
   * @param idPeticionEvaluacion id de la peticion de evaluacion.
   * @return las memorias de la PeticionEvaluacion.
   */
  findMemorias(idPeticionEvaluacion: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IMemoriaPeticionEvaluacion>> {
    this.logger.debug(PeticionEvaluacionService.name, `findMemorias(${idPeticionEvaluacion})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/memorias`;
    return this.find<IMemoriaPeticionEvaluacion, IMemoriaPeticionEvaluacion>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(PeticionEvaluacionService.name, `findMemorias(${idPeticionEvaluacion})`, '-', 'end'))
      );
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
    this.logger.debug(PeticionEvaluacionService.name, `createEquipoTrabajo(${idPeticionEvaluacion}, ${JSON.stringify(equipoTrabajo)})`, '-', 'START');
    return this.http.post<IEquipoTrabajo>(`${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo`, equipoTrabajo).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(PeticionEvaluacionService.name,
          `createEquipoTrabajo(${idPeticionEvaluacion}, ${JSON.stringify(equipoTrabajo)}):`, error);
        return throwError(error);
      }),
      tap(_ => {
        this.logger.debug(PeticionEvaluacionService.name, `createEquipoTrabajo(${idPeticionEvaluacion}, ${JSON.stringify(equipoTrabajo)})`, '-', 'END');
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
    this.logger.debug(PeticionEvaluacionService.name,
      `createTarea(${idPeticionEvaluacion}, ${idEquipoTrabajo}, ${JSON.stringify(tarea)})`, '-', 'START');

    const endpointUrl = `${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo/${idEquipoTrabajo}/tareas`;
    return this.http.post<ITarea>(endpointUrl, tarea)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.logger.error(PeticionEvaluacionService.name,
            `createTarea(${idPeticionEvaluacion}, ${JSON.stringify(tarea)}):`, error);
          return throwError(error);
        }),
        tap(_ => {
          this.logger.debug(PeticionEvaluacionService.name, `createTarea(${idPeticionEvaluacion}, ${idEquipoTrabajo}, ${JSON.stringify(tarea)})`, '-', 'END');
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
    this.logger.debug(PeticionEvaluacionService.name, `deleteEquipoTrabajoPeticionEvaluacion(${idPeticionEvaluacion}, ${idEquipoTrabajo})`, '-', 'START');
    return this.http.delete<void>(`${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo/${idEquipoTrabajo}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(PeticionEvaluacionService.name,
          `deleteTareaPeticionEvaluacion(${idPeticionEvaluacion}, ${idEquipoTrabajo}):`, error);
        return throwError(error);
      }),
      tap(_ => {
        this.logger.debug(PeticionEvaluacionService.name, `deleteEquipoTrabajoPeticionEvaluacion(${idPeticionEvaluacion}, ${idEquipoTrabajo})`, '-', 'END');
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
    this.logger.debug(PeticionEvaluacionService.name, `deleteTareaPeticionEvaluacion(${idPeticionEvaluacion}, ${idEquipoTrabajo}, ${idTarea})`, '-', 'START');
    return this.http.delete<void>(`${this.endpointUrl}/${idPeticionEvaluacion}/equipos-trabajo/${idEquipoTrabajo}/tareas/${idTarea}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.logger.error(PeticionEvaluacionService.name, `deleteTareaPeticionEvaluacion(${idPeticionEvaluacion}, ${idEquipoTrabajo}, ${idTarea}):`, error);
        return throwError(error);
      }),
      tap(() => {
        this.logger.debug(PeticionEvaluacionService.name, `deleteTareaPeticionEvaluacion(${idPeticionEvaluacion}, ${idEquipoTrabajo}, ${idTarea})`, '-', 'END');
      })
    );
  }

  findAllByPersonaRef(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IPeticionEvaluacion>> {
    this.logger.debug(PeticionEvaluacionService.name, `findAllByPersonaRef()`, '-', 'START');
    return this.find<IPeticionEvaluacion, IPeticionEvaluacion>(`${this.endpointUrl}/persona`, options).pipe(
      tap(() => this.logger.debug(PeticionEvaluacionService.name, `findAllByPersonaRef()`, '-', 'END'))
    );
  }
}
