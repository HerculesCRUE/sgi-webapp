import { IAreaTematica } from './area-tematica';

export interface ISolicitudProyecto {
  id: number;
  titulo: string;
  acronimo: string;
  codExterno: string;
  duracion: number;
  colaborativo: boolean;
  coordinadorExterno: boolean;
  objetivos: string;
  intereses: string;
  resultadosPrevistos: string;
  areaTematica: IAreaTematica;
  checkListRef: string;
  envioEtica: boolean;
  presupuestoPorEntidades: boolean;
}
