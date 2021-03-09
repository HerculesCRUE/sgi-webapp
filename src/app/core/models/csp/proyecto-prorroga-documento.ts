import { IProyectoProrroga } from './proyecto-prorroga';
import { ITipoDocumento } from './tipos-configuracion';

export interface IProyectoProrrogaDocumento {
  id: number;
  proyectoProrroga: IProyectoProrroga;
  nombre: string;
  documentoRef: string;
  tipoDocumento: ITipoDocumento;
  visible: boolean;
  comentario: string;
}
