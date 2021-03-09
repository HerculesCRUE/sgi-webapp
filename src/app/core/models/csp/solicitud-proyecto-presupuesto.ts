import { IEmpresaEconomica } from '../sgp/empresa-economica';
import { IPartidaGasto } from './partida-gasto';
import { ISolicitudProyectoDatos } from './solicitud-proyecto-datos';

export interface ISolicitudProyectoPresupuesto extends IPartidaGasto {
  solicitudProyectoDatos: ISolicitudProyectoDatos;
  empresa: IEmpresaEconomica;
  financiacionAjena: boolean;
}
