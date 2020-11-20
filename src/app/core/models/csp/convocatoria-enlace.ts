import { IConvocatoria } from './convocatoria';
import { ITipoEnlace } from './tipos-configuracion';

export interface IConvocatoriaEnlace {

  /** id */
  id: number;

  /** tipoEnlace */
  tipoEnlace: ITipoEnlace;

  /** activo */
  activo: boolean;

  /** convocatoria */
  convocatoria: IConvocatoria;

  /** URL */
  url: string;

  /** descripcion */
  descripcion: string;

}
