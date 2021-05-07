import { IConceptoGasto } from '../tipos-configuracion';

export interface ISolicitudProyectoPresupuestoBackend {
  id: number;
  solicitudProyectoId: number;
  conceptoGasto: IConceptoGasto;
  entidadRef: string;
  anualidad: number;
  importeSolicitado: number;
  observaciones: string;
  financiacionAjena: boolean;
}
