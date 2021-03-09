import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IProyecto } from './proyecto';


export interface IProyectoProrroga {
  id: number;
  proyecto: IProyecto;
  numProrroga: number;
  fechaConcesion: Date;
  tipo: Tipo;
  fechaFin: Date;
  importe: number;
  observaciones: string;
}

export enum Tipo {
  TIEMPO = 'TIEMPO',
  IMPORTE = 'IMPORTE',
  TIEMPO_IMPORTE = 'TIEMPO_IMPORTE'
}

export const TIPO_MAP: Map<Tipo, string> = new Map([
  [Tipo.TIEMPO, marker(`csp.proyecto-prorroga.tipo.TIEMPO`)],
  [Tipo.IMPORTE, marker(`csp.proyecto-prorroga.tipo.IMPORTE`)],
  [Tipo.TIEMPO_IMPORTE, marker(`csp.proyecto-prorroga.tipo.TIEMPO_IMPORTE`)]
]);