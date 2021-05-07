import { IEmpresa } from '../sgemp/empresa';
export interface IConvocatoriaEntidadGestora {
  id: number;
  convocatoriaId: number;
  empresa: IEmpresa;
}
