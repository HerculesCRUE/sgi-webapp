import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAsistente } from '@core/models/eti/asistente';
import { IComite } from '@core/models/eti/comite';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { TipoConvocatoriaReunion } from '@core/models/eti/tipo-convocatoria-reunion';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core/';
import { SgiMutableRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


interface IConvocatoriaReunionService {

  /** ID */
  id: number;
  /** Comite */
  comite: IComite;
  /** Tipo Convocatoria Reunion */
  tipoConvocatoriaReunion: TipoConvocatoriaReunion;
  /** Fecha evaluación */
  fechaEvaluacion: Date;
  /** Hora fin */
  horaInicio: number;
  /** Minuto inicio */
  minutoInicio: number;
  /** Fecha Limite */
  fechaLimite: Date;
  /** Lugar */
  lugar: string;
  /** Orden día */
  ordenDia: string;
  /** Año */
  anio: number;
  /** Numero acta */
  numeroActa: number;
  /** Fecha Envío */
  fechaEnvio: Date;
  /** Activo */
  activo: boolean;
  /** Num Evaluaciones */
  numEvaluaciones: number;
  /** id Acta */
  idActa: number;
}


@Injectable({
  providedIn: 'root',
})
export class ConvocatoriaReunionService extends SgiMutableRestService<number, IConvocatoriaReunionService, IConvocatoriaReunion> {
  private static readonly MAPPING = '/convocatoriareuniones';
  private static readonly CONVERTER = new class extends SgiBaseConverter<IConvocatoriaReunionService, IConvocatoriaReunion> {
    toTarget(value: IConvocatoriaReunionService): IConvocatoriaReunion {
      return {
        id: value.id,
        comite: value.comite,
        tipoConvocatoriaReunion: value.tipoConvocatoriaReunion,
        fechaEvaluacion: value.fechaEvaluacion,
        horaInicio: value.horaInicio,
        minutoInicio: value.minutoInicio,
        fechaLimite: value.fechaLimite,
        lugar: value.lugar,
        ordenDia: value.ordenDia,
        anio: value.anio,
        numeroActa: value.numeroActa,
        fechaEnvio: value.fechaEnvio,
        activo: value.activo,
        convocantes: [],
        codigo: `ACTA${value.numeroActa}/${value.anio}/${value.comite.comite}`,
        numEvaluaciones: value.numEvaluaciones,
        idActa: value.idActa,
      };
    }

    fromTarget(value: IConvocatoriaReunion): IConvocatoriaReunionService {
      return {
        id: value.id,
        comite: value.comite,
        tipoConvocatoriaReunion: value.tipoConvocatoriaReunion,
        fechaEvaluacion: value.fechaEvaluacion,
        horaInicio: value.horaInicio,
        minutoInicio: value.minutoInicio,
        fechaLimite: value.fechaLimite,
        lugar: value.lugar,
        ordenDia: value.ordenDia,
        anio: value.anio,
        numeroActa: value.numeroActa,
        fechaEnvio: value.fechaEnvio,
        activo: value.activo,
        numEvaluaciones: value.numEvaluaciones,
        idActa: value.idActa,
      };
    }
  }();


  constructor(private readonly logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaReunionService.name,
      `${environment.serviceServers.eti}${ConvocatoriaReunionService.MAPPING}`,
      http, ConvocatoriaReunionService.CONVERTER
    );
  }

  /**
   * Devuelve todos los asistentes por convocatoria id.
   * @param idConvocatoria id convocatoria.
   */
  findAsistentes(idConvocatoria: number): Observable<SgiRestListResult<IAsistente>> {
    return this.find<IAsistente, IAsistente>(`${this.endpointUrl}/${idConvocatoria}/asistentes`, null);
  }

  /**
   * Devuelve todos las evaluaciones por convocatoria id.
   * @param idConvocatoria id convocatoria.
   */
  findEvaluacionesActivas(idConvocatoria: number): Observable<SgiRestListResult<IEvaluacion>> {
    return this.find<IEvaluacion, IEvaluacion>(`${this.endpointUrl}/${idConvocatoria}/evaluaciones-activas`, null);
  }

  /**
   * Devuelve la convocatoria por id.con el número de evaluaciones activas que no son revisión mínima
   * @param idConvocatoria id convocatoria.
   */
  public findByIdWithDatosGenerales(idConvocatoria: number): Observable<IConvocatoriaReunion> {
    return this.http.get<IConvocatoriaReunion>(`${this.endpointUrl}/${idConvocatoria}/datos-generales`).pipe(
      // TODO: Explore the use a global HttpInterceptor with or without a custom error
      catchError((error: HttpErrorResponse) => {
        // Log the error
        this.logger.error(error);
        // Pass the error to subscribers. Anyway they would decide what to do with the error.
        return throwError(error);
      }),
      map((convocatoriaReunion: IConvocatoriaReunion) => {
        return this.converter.toTarget(convocatoriaReunion);
      })
    );
  }

  /** Elimina las memorias asignadas a la convocatoria de reunión
   * @param evaluacion la Evaluacion a borrar
   */
  deleteEvaluacion(evaluacion: IEvaluacion) {
    return this.http.delete<void>(`${this.endpointUrl}/${evaluacion.convocatoriaReunion.id}/evaluacion/${evaluacion.id}`);
  }


  /**
   * Devuelve todos las convocatorias que no estén asociadas a un acta.
   * @param options opciones de búsqueda.
   */
  findConvocatoriasSinActa(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaReunion>> {
    return this.find<IConvocatoriaReunionService, IConvocatoriaReunion>(`${this.endpointUrl}/acta-no-asignada`, null
      , ConvocatoriaReunionService.CONVERTER);
  }

}
