import { IPersona } from '../sgp/persona';
import { ITipoActividad } from './tipo-actividad';
import { ITipoInvestigacionTutelada } from './tipo-investigacion-tutelada';

export interface IPeticionEvaluacion extends IPersona {

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
  fechaInicio: Date;

  /** Fecha Fin. */
  fechaFin: Date;

  /** Resumen */
  resumen: string;

  /** Valor social */
  valorSocial: number;

  /** Otro valor social */
  otroValorSocial: string;

  /** Objetivos */
  objetivos: string;

  /** Diseño metodológico */
  disMetodologico: string;

  /** Externo */
  externo: boolean;

  /** Tiene fondos propios */
  tieneFondosPropios: boolean;

  /** Referencia persona */
  personaRef: string;

  /** Activo */
  activo: boolean;
}
