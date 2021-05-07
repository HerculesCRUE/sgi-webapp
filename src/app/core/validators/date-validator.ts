import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateTime } from 'luxon';

export class DateValidator {

  /**
   * Comprueba que la segunda fecha es posterior a la primera.
   *
   * @param firstDateFieldName Nombre del campo contra el que se quiere hacer la validacion.
   * @param secondDateFieldName Nombre del campo que se quiere validar.
   * @param errorIfFirstDateEmpty Mostrar error si la primera fecha no esta rellena (por defecto true).
   */
  static isAfter(firstDateFieldName: string, secondDateFieldName: string, errorIfFirstDateEmpty = true): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaAnteriorControl = formGroup.controls[firstDateFieldName];
      const fechaPosteriorControl = formGroup.controls[secondDateFieldName];

      if (fechaPosteriorControl.errors && !fechaPosteriorControl.errors.after) {
        return;
      }

      const fechaAnteriorDate: DateTime = fechaAnteriorControl.value;
      const fechaPosteriorDate: DateTime = fechaPosteriorControl.value;

      if (fechaPosteriorDate && ((!fechaAnteriorDate && errorIfFirstDateEmpty)
        || (fechaAnteriorDate && fechaAnteriorDate >= fechaPosteriorDate))) {
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

      const fechaAnteriorDate: DateTime = fechaAnteriorControl.value;
      const fechaPosteriorDate: DateTime = fechaPosteriorControl.value;


      if (fechaPosteriorDate && (fechaAnteriorDate > fechaPosteriorDate)) {
        fechaPosteriorControl.setErrors({ after: true });
        fechaPosteriorControl.markAsTouched({ onlySelf: true });
      } else if (fechaPosteriorControl.errors) {
        delete fechaPosteriorControl.errors.after;
        fechaPosteriorControl.updateValueAndValidity({ onlySelf: true });
      }
    };
  }

  /**
   * Comprueba que la segunda fecha sea anterior o igual a la primera.
   *
   * @param firstDateFieldName Nombre del campo contra el que se quiere hacer la validacion.
   * @param secondDateFieldName Nombre del campo que se quiere validar.
   */
  static isBeforeOrEqual(firstDateFieldName: string, secondDateFieldName: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaAnteriorControl = formGroup.controls[secondDateFieldName];
      const fechaPosteriorControl = formGroup.controls[firstDateFieldName];

      if (fechaAnteriorControl.errors && !fechaAnteriorControl.errors.before) {
        return;
      }

      const fechaAnteriorDate: DateTime = fechaAnteriorControl.value;
      const fechaPosteriorDate: DateTime = fechaPosteriorControl.value;


      if (fechaAnteriorDate && (fechaPosteriorDate < fechaAnteriorDate)) {
        fechaAnteriorControl.setErrors({ before: true });
        fechaAnteriorControl.markAsTouched({ onlySelf: true });
      } else if (fechaAnteriorControl.errors) {
        delete fechaAnteriorControl.errors.before;
        fechaAnteriorControl.updateValueAndValidity({ onlySelf: true });
      }
    };
  }

  /**
   * Comprueba que la segunda fecha sea anterior a la primera.
   *
   * @param firstDateFieldName Nombre del campo contra el que se quiere hacer la validacion.
   * @param secondDateFieldName Nombre del campo que se quiere validar.
   */
  static isBefore(firstDateFieldName: string, secondDateFieldName: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaAnteriorControl = formGroup.controls[secondDateFieldName];
      const fechaPosteriorControl = formGroup.controls[firstDateFieldName];

      if (fechaAnteriorControl.errors && !fechaAnteriorControl.errors.before) {
        return;
      }

      const fechaAnteriorDate: DateTime = fechaAnteriorControl.value;
      const fechaPosteriorDate: DateTime = fechaPosteriorControl.value;


      if (fechaAnteriorDate && (fechaPosteriorDate <= fechaAnteriorDate)) {
        fechaAnteriorControl.setErrors({ before: true });
        fechaAnteriorControl.markAsTouched({ onlySelf: true });
      } else if (fechaAnteriorControl.errors) {
        delete fechaAnteriorControl.errors.before;
        fechaAnteriorControl.updateValueAndValidity({ onlySelf: true });
      }
    };
  }

  static maxDate(maxDate: DateTime): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      if (control.value > maxDate) {
        return { maxDate: true };
      }
      return null;
    };
  }

  static minDate(minDate: DateTime): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      if (control.value < minDate) {
        return { minDate: true };
      }
      return null;
    };
  }

  static rangeWithTime(controlName: string, beforeControlName: string, afterControlName: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const control = formGroup.controls[controlName];
      if (control.errors) {
        delete control.errors.rangeWithTime;
        if (Object.keys(control.errors).length === 0) {
          control.setErrors(null);
        }
      }
      const beforeControl = formGroup.controls[beforeControlName];
      const afterControl = formGroup.controls[afterControlName];
      if (beforeControl.value && afterControl.value && control.value) {
        const date: DateTime = control.value;
        const before: DateTime = beforeControl.value;
        const after: DateTime = afterControl.value;
        if (after >= date && date >= before) {
          return;
        }
        control.setErrors({ rangeWithTime: true });
        control.markAsTouched({ onlySelf: true });
        return;
      }
    };
  }

  /**
   * Comprueba que la fecha este entre las fecha indicadas
   *
   * @param minDate fecha minima
   * @param maxDate fecha maxima
   */
  static isBetween(minDate: DateTime, maxDate: DateTime): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if ((control.errors && !control.errors.invalid
        || control.errors && !control.errors.invalid)) {
        return null;
      }

      const date = control.value;
      if (date && (date < minDate || date > maxDate)) {
        return { invalid: true } as ValidationErrors;
      }

      return null;
    };
  }

}
