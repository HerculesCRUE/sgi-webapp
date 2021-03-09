import { IConvocatoria } from './convocatoria';
import { IEntidadFinanciadora } from './entidad-financiadora';

export interface IConvocatoriaEntidadFinanciadora extends IEntidadFinanciadora {
  /**
   * Convocatoria
   */
  convocatoria: IConvocatoria;
}
