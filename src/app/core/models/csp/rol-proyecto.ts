import { marker } from '@biesbjerg/ngx-translate-extract-marker';


export interface IRolProyecto {
  id: number;
  abreviatura: string;
  nombre: string;
  descripcion: string;
  rolPrincipal: boolean;
  responsableEconomico: boolean;
  equipo: Equipo;
  colectivoRef: string;
  activo: boolean;
}


export enum Equipo {
  INVESTIGACION = 'INVESTIGACION',
  TRABAJO = 'TRABAJO'
}

export const EQUIPO_MAP: Map<Equipo, string> = new Map([
  [Equipo.INVESTIGACION, marker('csp.rol-proyecto.equipo.INVESTIGACION')],
  [Equipo.TRABAJO, marker('csp.rol-proyecto.equipo.TRABAJO')],
]);
