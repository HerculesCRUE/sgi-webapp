import { DateTime } from 'luxon';
import { IPersona } from '../sgp/persona';
import { ITipoActividad } from './tipo-actividad';
import { ITipoInvestigacionTutelada } from './tipo-investigacion-tutelada';

export interface IPeticionEvaluacion {
  /** ID */
  id: number;
  /** Solicitud convocatoria ref */
  solicitudConvocatoriaRef: string;
  /** Código */
  codigo: string;
  /** Título */
  titulo: string;
  /** Tipo de actividad */
  tipoActividad: ITipoActividad;
  /** Tipo de investigacion tutelada */
  tipoInvestigacionTutelada: ITipoInvestigacionTutelada;
  /** Referencia fuente financiacion */
  fuenteFinanciacion: string;
  /** Fecha Inicio. */
  fechaInicio: DateTime;
  /** Fecha Fin. */
  fechaFin: DateTime;
  /** Resumen */
  resumen: string;
  /** Valor social */
  valorSocial: number;
  /** Objetivos */
  objetivos: string;
  /** Diseño metodológico */
  disMetodologico: string;
  /** Externo */
  externo: boolean;
  /** Tiene fondos propios */
  tieneFondosPropios: boolean;
  /** Referencia persona */
  solicitante: IPersona;
  /** Activo */
  activo: boolean;
}
