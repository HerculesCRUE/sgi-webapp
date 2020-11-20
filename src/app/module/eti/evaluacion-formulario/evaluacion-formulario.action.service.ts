import { ActionService } from '@core/services/action-service';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { EvaluacionComentarioFragment } from '../evaluacion-formulario/evaluacion-comentarios/evaluacion-comentarios.fragment';
import { EvaluacionDatosMemoriaFragment } from '../evaluacion-formulario/evaluacion-datos-memoria/evaluacion-datos-memoria.fragment';
import { EvaluacionDocumentacionFragment } from '../evaluacion-formulario/evaluacion-documentacion/evaluacion-documentacion.fragment';
import { EvaluacionEvaluacionFragment } from './evaluacion-evaluacion/evaluacion-evaluacion.fragment';
import { IDictamen } from '@core/models/eti/dictamen';

export enum Gestion { EVALUADOR, GESTOR }

export abstract class EvaluacionFormularioActionService extends ActionService {

  public readonly FRAGMENT = {
    COMENTARIOS: 'comentarios',
    EVALUACIONES: 'evaluaciones',
    MEMORIA: 'memoria',
    DOCUMENTACION: 'documentarion'
  };

  protected evaluacion: IEvaluacion;
  protected comentarios: EvaluacionComentarioFragment;
  protected datosMemoria: EvaluacionDatosMemoriaFragment;
  protected documentacion: EvaluacionDocumentacionFragment;
  protected evaluaciones: EvaluacionEvaluacionFragment;


  getEvaluacion(): IEvaluacion {
    return this.evaluacion;
  }

  setDictamen(dictamen: IDictamen): void {
    this.comentarios.setDictamen(dictamen);
  }

  abstract getGestion(): Gestion;
}
