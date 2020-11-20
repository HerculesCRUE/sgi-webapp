import { Profesional } from './profesional';

export interface IPersonaFisica {

  /** ID */
  personaRef: string;

  /** Fecha nacimiento */
  fechaNacimiento: string;

  /** Nacionalidad */
  nacionalidad: string;

  /** Sexo */
  sexo: string;

  /** Tipo persona */
  tipoPersona: string;

  /** Vinculacion */
  vinculacion: string;

  /** Profesional */
  profesional: Profesional;

}
