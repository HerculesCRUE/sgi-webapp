import { IConvocatoria } from './convocatoria';
import { IPrograma } from './programa';
import { IEmpresaEconomica } from '../sgp/empresa-economica';

export interface IConvocatoriaEntidadConvocante {
  id: number;
  convocatoria: IConvocatoria;
  entidad: IEmpresaEconomica;
  programa: IPrograma;
}
