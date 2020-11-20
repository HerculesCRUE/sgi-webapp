import { FormlyFieldConfig } from '@ngx-formly/core';
import { IBloque } from './bloque';

export interface IApartado {
  /** Id */
  id: number;

  /** Bloque del formulario */
  bloque: IBloque;

  /** Nombre */
  nombre: string;

  /** Apartado padre del formulario */
  padre: IApartado;

  /** Orden */
  orden: number;

  /** Esquema */
  esquema: FormlyFieldConfig[];
}
