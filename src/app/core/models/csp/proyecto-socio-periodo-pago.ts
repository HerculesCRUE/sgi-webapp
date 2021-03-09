import { IProyectoSocio } from './proyecto-socio';

export interface IProyectoSocioPeriodoPago {
  id: number;
  proyectoSocio: IProyectoSocio;
  numPeriodo: number;
  importe: number;
  fechaPrevistaPago: Date;
  fechaPago: Date;
}
