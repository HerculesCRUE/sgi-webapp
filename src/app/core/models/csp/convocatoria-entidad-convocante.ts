import { IConvocatoria } from './convocatoria';
import { IPrograma } from './programa';

export interface IConvocatoriaEntidadConvocante {
  id: number;
  convocatoria: IConvocatoria;
  entidadRef: string;
  programa: IPrograma;
}
