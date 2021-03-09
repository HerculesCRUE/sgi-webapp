import { IProyectoPeriodoSeguimiento } from './proyecto-periodo-seguimiento';
import { ITipoDocumento } from './tipos-configuracion';

export interface IProyectoPeriodoSeguimientoDocumento {
  id: number;
  proyectoPeriodoSeguimiento: IProyectoPeriodoSeguimiento;
  nombre: string;
  documentoRef: string;
  tipoDocumento: ITipoDocumento;
  visible: boolean;
  comentario: string;
}
