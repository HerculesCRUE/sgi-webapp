import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { TipoHorasAnuales } from '../proyecto';
import { ITipoAmbitoGeografico } from '../tipo-ambito-geografico';
import { IModeloEjecucion, ITipoFinalidad } from '../tipos-configuracion';
import { IEstadoProyectoBackend } from './estado-proyecto-backend';

export interface IProyectoBackend {
  /** Id */
  id: number;
  /** EstadoProyecto */
  estado: IEstadoProyectoBackend;
  /** Titulo */
  titulo: string;
  /** Acronimo */
  acronimo: string;
  /** codigoExterno */
  codigoExterno: string;
  /** Fecha Inicio */
  fechaInicio: string;
  /** Fecha Fin */
  fechaFin: string;
  /** modelo ejecucion */
  modeloEjecucion: IModeloEjecucion;
  /** finalidad */
  finalidad: ITipoFinalidad;
  /** Id de Convocatoria */
  convocatoriaId: number;
  /** Id de Solicitud */
  solicitudId: number;
  /** ambitoGeografico */
  ambitoGeografico: ITipoAmbitoGeografico;
  /** confidencial */
  confidencial: boolean;
  /** clasificacionCVN */
  clasificacionCVN: ClasificacionCVN;
  /** convocatoriaExterna */
  convocatoriaExterna: string;
  /** colaborativo */
  colaborativo: boolean;
  /** coordinadorExterno */
  coordinadorExterno: boolean;
  /** timesheet */
  timesheet: boolean;
  /** permitePaquetesTrabajo */
  permitePaquetesTrabajo: boolean;
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
  /** unidadGestionRef */
  unidadGestionRef: string;
  /** finalista */
  finalista: boolean;
  /** limitativo */
  limitativo: boolean;
  /** anualidades */
  anualidades: boolean;
  /** activo  */
  activo: boolean;
}
