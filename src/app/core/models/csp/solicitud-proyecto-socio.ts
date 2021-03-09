import { IEmpresaEconomica } from '../sgp/empresa-economica';
import { IRolSocio } from './rol-socio';
import { ISolicitudProyectoDatos } from './solicitud-proyecto-datos';

export interface ISolicitudProyectoSocio {
  id: number;
  solicitudProyectoDatos: ISolicitudProyectoDatos;
  empresa: IEmpresaEconomica;
  rolSocio: IRolSocio;
  mesInicio: number;
  mesFin: number;
  numInvestigadores: number;
  importeSolicitado: number;
}
