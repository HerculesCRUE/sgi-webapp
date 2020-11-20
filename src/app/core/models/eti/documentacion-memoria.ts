import { IMemoria } from './memoria';
import { ITipoDocumento } from './tipo-documento';

export interface IDocumentacionMemoria {
  /** Id */
  id: number;

  /** Memoria */
  memoria: IMemoria;

  /** TIpo de documento */
  tipoDocumento: ITipoDocumento;

  /** Ref del documento */
  documentoRef: string;

  /** Aportado */
  aportado: boolean;

  /** Fichero */
  fichero: File;
}
