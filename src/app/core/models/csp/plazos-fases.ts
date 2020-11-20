import { ITipoFase } from './tipos-configuracion';

export interface IPlazosFases {
  /** Id */
  id: number;

  /** Fecha Inicio */
  fechaInicio: Date;

  /** Plazos */
  tipoFase: ITipoFase;

  /** Fecha Fin */
  fechaFin: Date;

  /** Observaciones */
  observaciones: string;

  /** Activo */
  activo: boolean;

}
