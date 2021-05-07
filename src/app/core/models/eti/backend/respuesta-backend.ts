import { IApartado } from '../apartado';
import { IMemoriaBackend } from './memoria-backend';

export interface IRespuestaBackend {
  /** ID */
  id: number;
  /** Memoria */
  memoria: IMemoriaBackend;
  /** apartado */
  apartado: IApartado;
  /** valor */
  valor: {
    [name: string]: any;
  };
}
