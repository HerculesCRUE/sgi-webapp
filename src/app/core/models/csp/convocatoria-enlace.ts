import { ITipoEnlace } from './tipos-configuracion';

export interface IConvocatoriaEnlace {
  /** id */
  id: number;
  /** tipoEnlace */
  tipoEnlace: ITipoEnlace;
  /** activo */
  activo: boolean;
  /** Id de Convocatoria */
  convocatoriaId: number;
  /** URL */
  url: string;
  /** descripcion */
  descripcion: string;
}
