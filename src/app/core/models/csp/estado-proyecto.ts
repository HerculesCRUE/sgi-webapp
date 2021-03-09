import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IProyecto } from './proyecto';



export interface IEstadoProyecto {

  /** Id */
  id: number;

  /** Solicitud */
  solicitud: IProyecto;

  /** Estado */
  estado: Estado;

  /** Fecha estado */
  fechaEstado: Date;

  /** Comentario */
  comentario: string;


}

export enum Estado {
  BORRADOR = 'BORRADOR',
  PROVISIONAL = 'PROVISIONAL',
  ABIERTO = 'ABIERTO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}


export const ESTADO_MAP: Map<Estado, string> = new Map([
  [Estado.BORRADOR, marker(`csp.estado-proyecto.BORRADOR`)],
  [Estado.PROVISIONAL, marker(`csp.estado-proyecto.PROVISIONAL`)],
  [Estado.ABIERTO, marker(`csp.estado-proyecto.ABIERTO`)],
  [Estado.FINALIZADO, marker(`csp.estado-proyecto.FINALIZADO`)],
  [Estado.CANCELADO, marker(`csp.estado-proyecto.CANCELADO`)]
]);
