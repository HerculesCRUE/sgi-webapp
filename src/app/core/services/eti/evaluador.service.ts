
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConflictoInteres } from '@core/models/eti/conflicto-interes';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IEvaluacionSolicitante } from '@core/models/eti/evaluacion-solicitante';
import { IEvaluador } from '@core/models/eti/evaluador';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluadorService extends SgiRestService<number, IEvaluador>{

  private static readonly MAPPING = '/evaluadores';

  constructor(protected http: HttpClient) {
    super(EvaluadorService.name, `${environment.serviceServers.eti}${EvaluadorService.MAPPING}`, http);
  }

  /**
   * Devuelve las evaluaciones cuyo evaluador sea el usuario en sesión
   *
   * @param options Opciones de filtrado y ordenación
   */
  getEvaluaciones(options?: SgiRestFindOptions): Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    return this.find<IEvaluacion, IEvaluacionSolicitante>
      (`${this.endpointUrl}/evaluaciones`, options);
  }

  /**
   * Devuelve los seguimientos cuyo evaluador sea el usuario en sesión
   *
   * @param options Opciones de filtrado y ordenación
   */
  getSeguimientos(options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IEvaluacionSolicitante>> {
    return this.find<IEvaluacion, IEvaluacionSolicitante>(`${this.endpointUrl}/evaluaciones-seguimiento`, options);
  }

  /**
   * Devuelve todos las memorias asignables a la convocatoria
   *
   * @param idComite id comite.
   * @param idMemoria id memoria.
   * @param options opciones de busqueda.
   * @return las memorias asignables a la convocatoria.
   */
  findAllMemoriasAsignablesConvocatoria(idComite: number, idMemoria: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IEvaluador>> {
    return this.find<IEvaluador, IEvaluador>(`${this.endpointUrl}/comite/${idComite}/sinconflictointereses/${idMemoria}`, options);
  }


  /**
   * Devuelve todos los conflictos de interés por evaluador id.
   * @param idEvaluador id evaluador.
   */
  findConflictosInteres(idEvaluador: number) {
    return this.find<IConflictoInteres, IConflictoInteres>(`${this.endpointUrl}/${idEvaluador}/conflictos`, null);
  }
}
