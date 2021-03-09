import { IAreaTematica } from './area-tematica';
import { ISolicitud } from './solicitud';

export interface ISolicitudProyectoDatos {
  id: number;
  solicitud: ISolicitud;
  titulo: string;
  acronimo: string;
  duracion: number;
  colaborativo: boolean;
  coordinadorExterno: boolean;
  universidadSubcontratada: boolean;
  objetivos: string;
  intereses: string;
  resultadosPrevistos: string;
  areaTematica: IAreaTematica;
  checkListRef: string;
  envioEtica: boolean;
  presupuestoPorEntidades: boolean;
}
