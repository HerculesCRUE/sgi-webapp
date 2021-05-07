import { IDocumentacionMemoriaBackend } from '@core/models/eti/backend/documentacion-memoria-backend';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { SgiBaseConverter } from '@sgi/framework/core';
import { MEMORIA_CONVERTER } from './memoria.converter';

class DocumentacionMemoriaConverter extends SgiBaseConverter<IDocumentacionMemoriaBackend, IDocumentacionMemoria> {
  toTarget(value: IDocumentacionMemoriaBackend): IDocumentacionMemoria {
    if (!value) {
      return value as unknown as IDocumentacionMemoria;
    }
    return {
      id: value.id,
      memoria: MEMORIA_CONVERTER.toTarget(value.memoria),
      tipoDocumento: value.tipoDocumento,
      documentoRef: value.documentoRef,
      aportado: value.aportado,
      fichero: null
    };
  }

  fromTarget(value: IDocumentacionMemoria): IDocumentacionMemoriaBackend {
    if (!value) {
      return value as unknown as IDocumentacionMemoriaBackend;
    }
    return {
      id: value.id,
      memoria: MEMORIA_CONVERTER.fromTarget(value.memoria),
      tipoDocumento: value.tipoDocumento,
      documentoRef: value.documentoRef,
      aportado: value.aportado,
    };
  }
}

export const DOCUMENTACION_MEMORIA_CONVERTER = new DocumentacionMemoriaConverter();
