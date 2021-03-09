import { IProyecto } from './proyecto';
import { IPrograma } from './programa';
import { IEmpresaEconomica } from '../sgp/empresa-economica';

export interface IProyectoEntidadConvocante {
  id: number;
  entidad: IEmpresaEconomica;
  programaConvocatoria: IPrograma;
  programa: IPrograma;
}
