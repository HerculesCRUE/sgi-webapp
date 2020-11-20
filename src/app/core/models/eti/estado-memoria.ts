
import { IMemoria } from './memoria';
import { TipoEstadoMemoria } from './tipo-estado-memoria';

export interface EstadoMemoria {
  /** ID */
  id: number;
  /** Memoria */
  memoria: IMemoria;
  /** Tipo estado memoria */
  tipoEstadoMemoria: TipoEstadoMemoria;
  /** Fecha Estado */
  fechaEstado: Date;
}
