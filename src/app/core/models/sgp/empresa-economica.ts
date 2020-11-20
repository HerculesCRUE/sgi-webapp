export enum TipoEmpresaEconomica {
  ENTIDAD = 'Entidad',
  SUBENTIDAD = 'Subentidad'
}

export interface IEmpresaEconomica {

  /** ID */
  personaRef: string;

  /** PersonaRef padre */
  personaRefPadre: string;

  /** Razon social */
  razonSocial: string;

  /** Tipo documento */
  tipoDocumento: string;

  /** Numero documento */
  numeroDocumento: string;

  /** Direccion */
  direccion: string;

  /** Tipo empresa */
  tipoEmpresa: string;

  /** Tipo */
  tipo: TipoEmpresaEconomica;

}
