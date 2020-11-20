
import { IMemoria } from './memoria';

export interface IMemoriaPeticionEvaluacion extends IMemoria {

  /** Fecha evaluación. */
  fechaEvaluacion: Date;

  /** 	Fecha límite. */
  fechaLimite: Date;

}
