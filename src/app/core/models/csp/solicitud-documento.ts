import { ISolicitud } from './solicitud';
import { ITipoDocumento } from './tipos-configuracion';

export interface ISolicitudDocumento {
  id: number;
  solicitud: ISolicitud;
  comentario: string;
  documentoRef: string;
  nombre: string;
  tipoDocumento: ITipoDocumento;
}
