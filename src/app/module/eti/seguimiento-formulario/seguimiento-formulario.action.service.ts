import { ActionService } from '@core/services/action-service';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { SeguimientoComentarioFragment } from './seguimiento-comentarios/seguimiento-comentarios.fragment';
import { SeguimientoDatosMemoriaFragment } from './seguimiento-datos-memoria/seguimiento-datos-memoria.fragment';
import { SeguimientoDocumentacionFragment } from './seguimiento-documentacion/seguimiento-documentacion.fragment';
import { SeguimientoEvaluacionFragment } from './seguimiento-evaluacion/seguimiento-evaluacion.fragment';

export enum Gestion { EVALUADOR, GESTOR }

export abstract class SeguimientoFormularioActionService extends ActionService {

  public readonly FRAGMENT = {
    COMENTARIOS: 'comentarios',
    EVALUACIONES: 'evaluaciones',
    MEMORIA: 'memoria',
    DOCUMENTACION: 'documentarion'
  };

  protected evaluacion: IEvaluacion;
  protected comentarios: SeguimientoComentarioFragment;
  protected datosMemoria: SeguimientoDatosMemoriaFragment;
  protected documentacion: SeguimientoDocumentacionFragment;
  protected evaluaciones: SeguimientoEvaluacionFragment;


  getEvaluacion(): IEvaluacion {
    return this.evaluacion;
  }

  setDictamen(dictamen) {
    this.comentarios.setDictamen(dictamen);
  }

  abstract getGestion(): Gestion;
}
