import { TipoVia } from './tipo-via';

export interface Domicilio {

  /** Tipo vía */
  tipoVia: TipoVia;

  /** Nombre vía */
  nombreVia: string;

  /** Número */
  numero: string;

  /** Población */
  poblacion: string;

  /** Código postal */
  codigoPostal: string;

  /** Provincia */
  provincia: string;

  /** País */
  pais: string;
}
