import { IRolProyecto } from './rol-proyecto';
import { ISolicitudProyectoDatos } from './solicitud-proyecto-datos';
import { IPersona } from '../sgp/persona';

export interface ISolicitudProyectoEquipo {
  id: number;
  solicitudProyectoDatos: ISolicitudProyectoDatos;
  persona: IPersona;
  rolProyecto: IRolProyecto;
  mesInicio: number;
  mesFin: number;
}
