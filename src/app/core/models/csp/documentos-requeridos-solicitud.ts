import { IConfiguracionSolicitud } from './configuracion-solicitud';
import { ITipoDocumento } from './tipos-configuracion';

export interface IDocumentoRequerido {
  id: number;
  configuracionSolicitud: IConfiguracionSolicitud;
  tipoDocumento: ITipoDocumento;
  observaciones: string;
}
