import { IComite } from '../comite';
import { TipoEstadoMemoria } from '../tipo-estado-memoria';
import { TipoMemoria } from '../tipo-memoria';
import { IPeticionEvaluacionBackend } from './peticion-evaluacion-backend';
import { IRetrospectivaBackend } from './retrospectiva-backend';

export interface IMemoriaBackend {
  /** Id */
  id: number;

  numReferencia: string;
  /** Petición evaluación */
  peticionEvaluacion: IPeticionEvaluacionBackend;
  /** Comité */
  comite: IComite;
  /** Título */
  titulo: string;
  /** Referencia persona responsable */
  personaRef: string;
  /** Tipo Memoria */
  tipoMemoria: TipoMemoria;
  /** Fecha envio secretaria. */
  fechaEnvioSecretaria: string;
  /** Indicador require retrospectiva */
  requiereRetrospectiva: boolean;
  /** Version */
  version: number;
  /** Estado Memoria Actual */
  estadoActual: TipoEstadoMemoria;
  /** Responsable de memoria */
  isResponsable: boolean;
  /** Retrospectiva */
  retrospectiva: IRetrospectivaBackend;
  /** Código organo */
  codOrganoCompetente: string;
  /** Memoria original */
  memoriaOriginal: IMemoriaBackend;
  /** Activo */
  activo: boolean;
}
