import { IProyectoSocio } from './proyecto-socio';
import { IRolProyecto } from './rol-proyecto';
import { IPersona } from '../sgp/persona';

export interface IProyectoSocioEquipo {
  id: number;
  proyectoSocio: IProyectoSocio;
  rolProyecto: IRolProyecto;
  persona: IPersona;
  fechaInicio: Date;
  fechaFin: Date;
}
