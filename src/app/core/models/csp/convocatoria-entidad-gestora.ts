import { IConvocatoria } from './convocatoria';

export interface IConvocatoriaEntidadGestora {
  id: number;
  convocatoria: IConvocatoria;
  entidadRef: string;
}
