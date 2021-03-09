import { IProyecto } from "./proyecto";
import { ITipoHito } from "./tipos-configuracion";

export interface IProyectoHito {
  /** Id */
  id: number;

  /** Proyecto */
  proyecto: IProyecto;

  /** Tipo de hito */
  tipoHito: ITipoHito;

  /** Fecha  */
  fecha: Date;

  /** Comentario */
  comentario: string;

  /** Aviso */
  generaAviso: boolean;

}
