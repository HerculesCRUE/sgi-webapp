import { IMemoria } from './memoria';

export interface IInforme {
  /** Id */
  id: number;

  /** Memoria */
  memoria: IMemoria;

  /** referencia */
  documentoRef: string;

  /** Version */
  version: number;
}
