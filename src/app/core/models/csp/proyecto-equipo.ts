import { IPersona } from '../sgp/persona';
import { IProyecto } from './proyecto';
import { IRolProyecto } from './rol-proyecto';

export interface IProyectoEquipo {

  /** Id */
  id: number;

  /** Proyecto */
  proyecto: IProyecto;

  /**
   * personaRef
   */
  persona: IPersona;

  /**
   * rolProyecto
   */
  rolProyecto: IRolProyecto;

  /**
   * fechaInicio
   */
  fechaInicio: Date;

  /**
   * fechaFin
   */
  fechaFin: Date;

  /**
   * horas dedicacion
   */
  horasDedicacion: number;
}
