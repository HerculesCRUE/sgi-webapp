import { ValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';
import { DateUtils } from '@core/utils/date-utils';
export class DateValidator {

  /**
   * Comprueba que la segunda fecha es posterior a la primera.
   *
   * @param firstDateFieldName Nombre del campo contra el que se quiere hacer la validacion.
   * @param secondDateFieldName Nombre del campo que se quiere validar.
   */
  static isAfter(firstDateFieldName: string, secondDateFieldName: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaAnteriorControl = formGroup.controls[firstDateFieldName];
      const fechaPosteriorControl = formGroup.controls[secondDateFieldName];

      if (fechaPosteriorControl.errors && !fechaPosteriorControl.errors.after) {
        return;
      }

      const fechaAnteriorDate = DateUtils.fechaToDate(fechaAnteriorControl.value);
      const fechaPosteriorDate = DateUtils.fechaToDate(fechaPosteriorControl.value);

      if (fechaPosteriorDate && (!fechaAnteriorDate || fechaAnteriorDate >= fechaPosteriorDate)) {
        fechaPosteriorControl.setErrors({ after: true });
        fechaPosteriorControl.markAsTouched({ onlySelf: true });
      } else if (fechaPosteriorControl.errors) {
        delete fechaPosteriorControl.errors.after;
        fechaPosteriorControl.updateValueAndValidity({ onlySelf: true });
      }
    };
  }

  /**
   * Comprueba que la segunda fecha es posterior o igual a la primera.
   *
   * @param firstDateFieldName Nombre del campo contra el que se quiere hacer la validacion.
   * @param secondDateFieldName Nombre del campo que se quiere validar.
   */
  static isAfterOrEqual(firstDateFieldName: string, secondDateFieldName: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaAnteriorControl = formGroup.controls[firstDateFieldName];
      const fechaPosteriorControl = formGroup.controls[secondDateFieldName];

      if (fechaPosteriorControl.errors && !fechaPosteriorControl.errors.after) {
        return;
      }

      const fechaAnteriorDate = DateUtils.fechaToDate(fechaAnteriorControl.value);
      const fechaPosteriorDate = DateUtils.fechaToDate(fechaPosteriorControl.value);


      if (fechaPosteriorDate && (fechaAnteriorDate > fechaPosteriorDate)) {
        fechaPosteriorControl.setErrors({ after: true });
        fechaPosteriorControl.markAsTouched({ onlySelf: true });
      } else if (fechaPosteriorControl.errors) {
        delete fechaPosteriorControl.errors.after;
        fechaPosteriorControl.updateValueAndValidity({ onlySelf: true });
      }
    };
  }

  static isBefore(fechaPosterior: string, fechaAnterior: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaAnteriorControl = formGroup.controls[fechaAnterior];
      const fechaPosteriorControl = formGroup.controls[fechaPosterior];

      if (fechaAnteriorControl.errors && !fechaAnteriorControl.errors.before) {
        return;
      }

      const fechaAnteriorDate = DateUtils.fechaToDate(fechaAnteriorControl.value);
      const fechaPosteriorDate = DateUtils.fechaToDate(fechaPosteriorControl.value);


      if (fechaAnteriorDate && (fechaPosteriorDate < fechaAnteriorDate)) {
        fechaAnteriorControl.setErrors({ before: true });
      } else {
        fechaAnteriorControl.setErrors(null);
      }
    };
  }
}
