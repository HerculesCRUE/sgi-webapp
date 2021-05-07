
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DateTime } from 'luxon';

export interface IEstadoSolicitud {
  /** Id */
  id: number;
  /** ID de la solicitud */
  solicitudId: number;
  /** Estado */
  estado: Estado;
  /** Fecha estado */
  fechaEstado: DateTime;
  /** Comentario */
  comentario: string;
}

export enum Estado {
  BORRADOR = 'BORRADOR',
  PRESENTADA = 'PRESENTADA',
  ADMITIDA_PROVISIONAL = 'ADMITIDA_PROVISIONAL',
  EXCLUIDA_PROVISIONAL = 'EXCLUIDA_PROVISIONAL',
  ALEGADA_ADMISION = 'ALEGADA_ADMISION',
  EXCLUIDA = 'EXCLUIDA',
  ADMITIDA_DEFINITIVA = 'ADMITIDA_DEFINITIVA',
  CONCECIDA_PROVISIONAL = 'CONCECIDA_PROVISIONAL',
  DENEGADA_PROVISIONAL = 'DENEGADA_PROVISIONAL',
  ALEGADA_CONCESION = 'ALEGADA_CONCESION',
  DESISTIDA = 'DESISTIDA',
  CONCECIDA = 'CONCECIDA',
  DENEGADA = 'DENEGADA',
}

export const ESTADO_MAP: Map<Estado, string> = new Map([
  [Estado.BORRADOR, marker(`csp.estado-solicitud.BORRADOR`)],
  [Estado.PRESENTADA, marker(`csp.estado-solicitud.PRESENTADA`)],
  [Estado.ADMITIDA_PROVISIONAL, marker(`csp.estado-solicitud.ADMITIDA_PROVISIONAL`)],
  [Estado.EXCLUIDA_PROVISIONAL, marker(`csp.estado-solicitud.EXCLUIDA_PROVISIONAL`)],
  [Estado.ALEGADA_ADMISION, marker(`csp.estado-solicitud.ALEGADA_ADMISION`)],
  [Estado.EXCLUIDA, marker(`csp.estado-solicitud.EXCLUIDA`)],
  [Estado.ADMITIDA_DEFINITIVA, marker(`csp.estado-solicitud.ADMITIDA_DEFINITIVA`)],
  [Estado.CONCECIDA_PROVISIONAL, marker(`csp.estado-solicitud.CONCECIDA_PROVISIONAL`)],
  [Estado.DENEGADA_PROVISIONAL, marker(`csp.estado-solicitud.DENEGADA_PROVISIONAL`)],
  [Estado.ALEGADA_CONCESION, marker(`csp.estado-solicitud.ALEGADA_CONCESION`)],
  [Estado.DESISTIDA, marker(`csp.estado-solicitud.DESISTIDA`)],
  [Estado.CONCECIDA, marker(`csp.estado-solicitud.CONCECIDA`)],
  [Estado.DENEGADA, marker(`csp.estado-solicitud.DENEGADA`)]
]);
