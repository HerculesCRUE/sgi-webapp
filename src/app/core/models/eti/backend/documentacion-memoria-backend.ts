import { ITipoDocumento } from '../tipo-documento';
import { IMemoriaBackend } from './memoria-backend';

export interface IDocumentacionMemoriaBackend {
  /** Id */
  id: number;
  /** Memoria */
  memoria: IMemoriaBackend;
  /** TIpo de documento */
  tipoDocumento: ITipoDocumento;
  /** Ref del documento */
  documentoRef: string;
  /** Aportado */
  aportado: boolean;
}
