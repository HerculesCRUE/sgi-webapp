import { FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { ITipoHito } from "@core/models/csp/tipos-configuracion";
import moment from 'moment';

/**
 * Comprueba que la fecha no se superpone con ninguna otra de la lista
 *
 * @param dateFieldName Nombre del campo de la fecha.
 * @param fechas Lista de fechas con las que se quiere comprobar.
 */
export class TipoHitoValidator {
  static notInDate(dateFieldName: string, fechas: Date[], tipoHito: ITipoHito[]): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaControl = formGroup.controls[dateFieldName];

      if ((fechaControl.errors && !fechaControl.errors.notIn)) {
        return;
      }

      const fechaInput = moment(fechaControl.value).format('DDMMYYYY');

      if (fechas.some(fecha => fechaInput === moment(fecha).format('DDMMYYYY') &&
        tipoHito.some(hito => formGroup.controls.tipoHito.value.id === hito.id))) {
        fechaControl.setErrors({ notIn: true });
        fechaControl.markAsTouched({ onlySelf: true });
      } else {
        if (fechaControl.errors) {
          delete fechaControl.errors.notIn;
          fechaControl.updateValueAndValidity({ onlySelf: true });
        }
      }
    };
  }
}