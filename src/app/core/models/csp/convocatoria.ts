import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { ITipoAmbitoGeografico } from './tipo-ambito-geografico';
import { ITipoRegimenConcurrencia } from './tipo-regimen-concurrencia';
import { IModeloEjecucion, ITipoFinalidad } from './tipos-configuracion';

export interface IConvocatoria {
  id: number;
  unidadGestionRef: string;
  modeloEjecucion: IModeloEjecucion;
  codigo: string;
  anio: number;
  titulo: string;
  objeto: string;
  observaciones: string;
  finalidad: ITipoFinalidad;
  regimenConcurrencia: ITipoRegimenConcurrencia;
  destinatarios: Destinatarios;
  colaborativos: boolean;
  estado: Estado;
  duracion: number;
  abiertoPlazoPresentacionSolicitud: boolean;
  ambitoGeografico: ITipoAmbitoGeografico;
  clasificacionCVN: ClasificacionCVN;
  activo: boolean;
}

export enum Destinatarios {
  INDIVIDUAL = 'INDIVIDUAL',
  EQUIPO_PROYECTO = 'EQUIPO_PROYECTO',
  GRUPO_INVESTIGACION = 'GRUPO_INVESTIGACION'
}

export const DESTINATARIOS_MAP: Map<Destinatarios, string> = new Map([
  [Destinatarios.INDIVIDUAL, marker(`csp.convocatoria.destinatarios.INDIVIDUAL`)],
  [Destinatarios.EQUIPO_PROYECTO, marker(`csp.convocatoria.destinatarios.EQUIPO_PROYECTO`)],
  [Destinatarios.GRUPO_INVESTIGACION, marker(`csp.convocatoria.destinatarios.GRUPO_INVESTIGACION`)]
]);

export enum Estado {
  BORRADOR = 'BORRADOR',
  REGISTRADA = 'REGISTRADA'
}

export const ESTADO_MAP: Map<Estado, string> = new Map([
  [Estado.BORRADOR, marker(`csp.convocatoria.estado.BORRADOR`)],
  [Estado.REGISTRADA, marker(`csp.convocatoria.estado.REGISTRADA`)]
]);
