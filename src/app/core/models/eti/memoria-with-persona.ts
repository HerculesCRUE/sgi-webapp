import { IPersona } from '@core/models/sgp/persona';

import { IMemoria } from './memoria';

export interface IMemoriaWithPersona extends IMemoria {
  solicitante: IPersona;
}
