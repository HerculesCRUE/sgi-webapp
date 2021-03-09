import { IProyecto } from './proyecto';
import { ITipoDocumento, ITipoFase } from './tipos-configuracion';

export interface IProyectoDocumento {
  id: number;
  proyecto: IProyecto;
  nombre: string;
  documentoRef: string;
  tipoFase: ITipoFase;
  tipoDocumento: ITipoDocumento;
  comentario: string;
  visible: boolean;
}
