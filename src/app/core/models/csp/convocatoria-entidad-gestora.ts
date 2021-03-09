import { IEmpresaEconomica } from '../sgp/empresa-economica';
import { IConvocatoria } from './convocatoria';

export interface IConvocatoriaEntidadGestora {
  id: number;
  convocatoria: IConvocatoria;
  empresaEconomica: IEmpresaEconomica;
}
