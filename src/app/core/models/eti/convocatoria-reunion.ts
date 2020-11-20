import { IComite } from './comite';
import { TipoConvocatoriaReunion } from './tipo-convocatoria-reunion';
import { IAsistente } from './asistente';

export interface IConvocatoriaReunion {

  /** ID */
  id: number;

  /** Comite */
  comite: IComite;

  /** Tipo Convocatoria Reunion */
  tipoConvocatoriaReunion: TipoConvocatoriaReunion;

  /** Fecha evaluación */
  fechaEvaluacion: Date;

  /** Hora fin */
  horaInicio: number;

  /** Minuto inicio */
  minutoInicio: number;

  /** Fecha Limite */
  fechaLimite: Date;

  /** Lugar */
  lugar: string;

  /** Orden día */
  ordenDia: string;

  /** Año */
  anio: number;

  /** Numero acta */
  numeroActa: number;

  /** Fecha Envío */
  fechaEnvio: Date;

  /** Activo */
  activo: boolean;

  /** Convocantes */
  convocantes: IAsistente[];

  /** Código */
  codigo: string;

  /** Num Evaluaciones */
  numEvaluaciones: number;

  /** id Acta */
  idActa: number;
}
