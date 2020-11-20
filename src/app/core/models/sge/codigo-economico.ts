export enum TipoCodigoEconomico {
  INGRESO = 'Ingreso',
  GASTO = 'Gasto'
}

export interface ICodigoEconomico {

  /** ID */
  codigoEconomicoRef: string;

  /** Código */
  codigo: string;

  /** Fecha inicio */
  fechaInicio: Date;

  /** Fecha fin */
  fechaFin: Date;

  /** Tipo */
  tipo: TipoCodigoEconomico;
}
