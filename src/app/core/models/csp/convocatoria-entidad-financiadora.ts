import { IConvocatoria } from './convocatoria';
import { IFuenteFinanciacion } from './fuente-financiacion';
import { ITipoFinanciacion } from './tipos-configuracion';

export interface IConvocatoriaEntidadFinanciadora {
  id: number;
  entidadRef: string;
  convocatoria: IConvocatoria;
  fuenteFinanciacion: IFuenteFinanciacion;
  tipoFinanciacion: ITipoFinanciacion;
  porcentajeFinanciacion: number;
}
