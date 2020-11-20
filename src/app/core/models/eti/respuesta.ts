import { IApartado } from './apartado';
import { IMemoria } from './memoria';

export interface IRespuesta {

  /** ID */
  id: number;
  /** Memoria */
  memoria: IMemoria;
  /** apartado */
  apartado: IApartado;
  /** valor */
  valor: {
    [name: string]: any;
  };
}
