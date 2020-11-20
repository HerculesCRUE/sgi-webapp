import { IAreaTematica } from './area-tematica';
import { IConvocatoria } from './convocatoria';

export interface IConvocatoriaAreaTematica {
  id: number;
  areaTematica: IAreaTematica;
  convocatoria: IConvocatoria;
  observaciones: string;
}
