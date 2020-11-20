
import { IDictamen } from './dictamen';

export class MemoriaListado {
  /** Id */
  id: number;

  /** número de referencia */
  numReferencia: string;

  /** Version */
  version: number;

  dictamen: IDictamen;

  constructor(id: number, numReferencia: string, version: number, dictamen: IDictamen) {
    this.id = id;
    this.numReferencia = numReferencia;
    this.version = version;
    this.dictamen = dictamen;
  }

}
