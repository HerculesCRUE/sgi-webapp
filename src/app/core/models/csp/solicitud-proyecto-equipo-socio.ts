import { ISolicitudProyectoSocio } from './solicitud-proyecto-socio';
import { IPersona } from '../sgp/persona';
import { IRolProyecto } from './rol-proyecto';

export interface ISolicitudProyectoEquipoSocio {
  id: number;
  solicitudProyectoSocio: ISolicitudProyectoSocio;
  persona: IPersona;
  rolProyecto: IRolProyecto;
  mesInicio: number;
  mesFin: number;
}
