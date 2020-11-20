import { IEstadoRetrospectiva } from './estado-retrospectiva';

export interface IRetrospectiva {

  /** ID */
  id: number;
  /** estadoRetrospectiva */
  estadoRetrospectiva: IEstadoRetrospectiva;
  /** fechaRetrospectiva */
  fechaRetrospectiva: Date;
}
