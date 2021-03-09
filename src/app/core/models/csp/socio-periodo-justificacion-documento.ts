import { IProyectoSocioPeriodoJustificacion } from './proyecto-socio-periodo-justificacion';
import { ITipoDocumento } from './tipos-configuracion';

export interface ISocioPeriodoJustificacionDocumento {
  id: number;
  proyectoSocioPeriodoJustificacion: IProyectoSocioPeriodoJustificacion;
  nombre: string;
  documentoRef: string;
  tipoDocumento: ITipoDocumento;
  comentario: string;
  visible: boolean;
}
