import { IEmpresaEconomica } from '../sgp/empresa-economica';
import { IFuenteFinanciacion } from './fuente-financiacion';
import { ITipoFinanciacion } from './tipos-configuracion';

export interface IEntidadFinanciadora {
  /**
   * ID
   */
  id: number;
  /**
   * Empresa economica
   */
  empresa: IEmpresaEconomica;
  /**
   * Fuente de financiación
   */
  fuenteFinanciacion: IFuenteFinanciacion;
  /**
   * Tipo de financiación
   */
  tipoFinanciacion: ITipoFinanciacion;
  /**
   * Porcentaje de financiación
   */
  porcentajeFinanciacion: number;
}
