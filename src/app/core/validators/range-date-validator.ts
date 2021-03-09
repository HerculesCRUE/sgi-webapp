import { ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { DateUtils } from '@core/utils/date-utils';

export interface DateRange {
  fechaInicio: Date;
  fechaFin: Date;
}

export class RangeDateValidator {
  static notOverlaps(dateRanges: DateRange[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = DateUtils.fechaToDate(control.value);
      for (const dataRange of dateRanges) {
        const fechaInicio = DateUtils.fechaToDate(dataRange.fechaInicio);
        const fechaFin = DateUtils.fechaToDate(dataRange.fechaFin);
        if (fechaInicio <= date && fechaFin >= date) {
          return { overlaps: true } as ValidationErrors;
        }
      }
      return null;
    };
  }
}
