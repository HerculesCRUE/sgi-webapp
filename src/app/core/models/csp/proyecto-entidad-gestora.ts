import { IEmpresaEconomica } from '../sgp/empresa-economica';
import { IEntidadFinanciadora } from './entidad-financiadora';
import { IProyecto } from './proyecto';

export interface IProyectoEntidadGestora {
  /**
   * Id del proyecto
   */
  id: number;

  /**
   * Proyecto
   */
  proyecto: IProyecto;

  /**
   * entidadRef
   */
  empresaEconomica: IEmpresaEconomica;

}
