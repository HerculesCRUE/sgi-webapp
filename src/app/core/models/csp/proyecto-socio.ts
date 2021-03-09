import { IEmpresaEconomica } from '../sgp/empresa-economica';
import { IProyecto } from './proyecto';
import { IRolSocio } from './rol-socio';


export interface IProyectoSocio {
  id: number;
  proyecto: IProyecto;
  empresa: IEmpresaEconomica;
  rolSocio: IRolSocio;
  fechaInicio: Date;
  fechaFin: Date;
  numInvestigadores: number;
  importeConcedido: number;
}