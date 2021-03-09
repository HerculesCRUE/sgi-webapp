import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { IUnidadGestion } from '../usr/unidad-gestion';
import { IConvocatoria } from './convocatoria';
import { IEstadoProyecto } from './estado-proyecto';
import { ISolicitud } from './solicitud';
import { ITipoAmbitoGeografico } from './tipo-ambito-geografico';
import { IModeloEjecucion, ITipoFinalidad } from './tipos-configuracion';



export interface IProyecto {

  /** Id */
  id: number;

  /** EstadoProyecto */
  estado: IEstadoProyecto;

  /** Titulo */
  titulo: string;

  /** Acronimo */
  acronimo: string;

  /** codigoExterno */
  codigoExterno: string;

  /** Fecha Inicio */
  fechaInicio: Date;

  /** Fecha Fin */
  fechaFin: Date;

  /** Comentario */
  comentario: string;

  /** Unidad gestion */
  unidadGestion: IUnidadGestion;

  /** modelo ejecucion */
  modeloEjecucion: IModeloEjecucion;

  /** convocatoriaExterna */
  convocatoriaExterna: string;

  /** finalidad */
  finalidad: ITipoFinalidad;

  /** convocatoria */
  convocatoria: IConvocatoria;

  /** solicitud */
  solicitud: ISolicitud;

  /** ambitoGeografico */
  ambitoGeografico: ITipoAmbitoGeografico;

  /** confidencial */
  confidencial: boolean;

  /** clasificacionCVN */
  clasificacionCVN: ClasificacionCVN;

  /** colaborativo */
  colaborativo: boolean;

  /** coordinadorExterno */
  coordinadorExterno: boolean;

  /** uniSubcontratada */
  uniSubcontratada: boolean;

  /** timesheet */
  timesheet: boolean;

  /** paquetesTrabajo */
  paquetesTrabajo: boolean;

  /** costeHora */
  costeHora: boolean;

  /** tipoHorasAnuales */
  tipoHorasAnuales: TipoHorasAnuales;

  /** contratos */
  contratos: boolean;

  /** facturacion */
  facturacion: boolean;

  /** iva */
  iva: boolean;

  /** observaciones */
  observaciones: string;

  /** finalista */
  finalista: boolean;

  /** limitativo */
  limitativo: boolean;

  /** anualidades */
  anualidades: boolean;

  /** activo  */
  activo: boolean;
}


export enum TipoHorasAnuales {
  FIJO = 'FIJO',
  REAL = 'REAL',
  CATEGORIA = 'CATEGORIA'
}

export const TIPO_HORAS_ANUALES_MAP: Map<TipoHorasAnuales, string> = new Map([
  [TipoHorasAnuales.FIJO, marker('csp.proyecto.tipo-horas-anuales.FIJO')],
  [TipoHorasAnuales.REAL, marker('csp.proyecto.tipo-horas-anuales.REAL')],
  [TipoHorasAnuales.CATEGORIA, marker('csp.proyecto.tipo-horas-anuales.CATEGORIA')]
]);