import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { TipoDestinatario } from '@core/enums/tipo-destinatario';
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
  destinatarios: TipoDestinatario;
  colaborativos: boolean;
  estadoActual: string;
  duracion: number;
  abiertoPlazoPresentacionSolicitud: boolean;
  ambitoGeografico: ITipoAmbitoGeografico;
  clasificacionCVN: ClasificacionCVN;
  activo: boolean;
}
