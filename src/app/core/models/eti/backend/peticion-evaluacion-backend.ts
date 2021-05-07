import { ITipoActividad } from '../tipo-actividad';
import { ITipoInvestigacionTutelada } from '../tipo-investigacion-tutelada';

export interface IPeticionEvaluacionBackend {
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
  fechaInicio: string;
  /** Fecha Fin. */
  fechaFin: string;
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
  /** Referencia persona solicitante */
  personaRef: string;
  /** Activo */
  activo: boolean;
}
