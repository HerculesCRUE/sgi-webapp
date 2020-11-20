import { IConvocatoria } from './convocatoria';
import { ITipoDocumento, ITipoFase } from './tipos-configuracion';

export interface IConvocatoriaDocumento {
  id: number;
  convocatoria: IConvocatoria;
  nombre: string;
  documentoRef: string;
  tipoFase: ITipoFase;
  tipoDocumento: ITipoDocumento;
  publico: boolean;
  observaciones: string;
}
