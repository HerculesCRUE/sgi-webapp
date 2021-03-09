import { IProyecto } from "./proyecto";

export interface IProyectoPaqueteTrabajo {

  /** Id */
  id: number;

  /** Proyecto */
  proyecto: IProyecto;

  /** nombre */
  nombre: string;

  /** fechaInicio */
  fechaInicio: Date;

  /** fechaFin */
  fechaFin: Date;

  /** personaMes */
  personaMes: number;

  /** descripcion */
  descripcion: string;

}
