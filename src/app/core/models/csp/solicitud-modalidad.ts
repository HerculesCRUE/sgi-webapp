import { IEmpresaEconomica } from '../sgp/empresa-economica';
import { ISolicitud } from './solicitud';
import { IPrograma } from './programa';

export interface ISolicitudModalidad {
  /** Id */
  id: number;

  /** Solicitud */
  solicitud: ISolicitud;

  /** Entidad */
  entidad: IEmpresaEconomica;

  /** Programa */
  programa: IPrograma;

}
