import { IEntidadFinanciadora } from './entidad-financiadora';
import { ISolicitudProyectoDatos } from './solicitud-proyecto-datos';

export interface ISolicitudProyectoEntidadFinanciadoraAjena extends IEntidadFinanciadora {
  solicitudProyectoDatos: ISolicitudProyectoDatos;
}
