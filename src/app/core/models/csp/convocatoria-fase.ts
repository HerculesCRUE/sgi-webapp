import { IConvocatoria } from './convocatoria';
import { ITipoFase } from './tipos-configuracion';

export interface IConvocatoriaFase {
  id: number;
  convocatoria: IConvocatoria;
  tipoFase: ITipoFase;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones: string;
}
