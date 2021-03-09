
import { IConvocatoria } from './convocatoria';
import { IEstadoSolicitud } from './estado-solicitud';
import { IPersona } from '../sgp/persona';
import { FormularioSolicitud } from '@core/enums/formulario-solicitud';
import { IUnidadGestion } from '../usr/unidad-gestion';

export interface ISolicitud {
  /** Id */
  id: number;

  /** Activo */
  activo: boolean;

  /** Codigo externo */
  codigoExterno: string;

  /** Codigo registro interno */
  codigoRegistroInterno: string;

  /** Estado solicitud */
  estado: IEstadoSolicitud;

  /** Convocatoria */
  convocatoria: IConvocatoria;

  /** Convocatoria externa */
  convocatoriaExterna: string;

  /** Creador */
  creador: IPersona;

  /** Solicitante */
  solicitante: IPersona;

  /** Tipo formulario solicitud */
  formularioSolicitud: FormularioSolicitud;

  /** Unidad gestion */
  unidadGestion: IUnidadGestion;

  /** Observaciones */
  observaciones: string;

}
