import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';

import { MatDialog } from '@angular/material/dialog';
import { SelectDialogComponent } from '@core/component/select-dialog/select-dialog.component';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { SearchConvocatoriaModalComponent } from './dialog/search-convocatoria.component';


@Component({
  selector: 'sgi-select-convocatoria',
  templateUrl: '../../../../core/component/select-dialog/select-dialog.component.html',
  styleUrls: ['../../../../core/component/select-dialog/select-dialog.component.scss'],
  // tslint:disable-next-line: no-inputs-metadata-property
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    'role': 'search',
    'aria-autocomplete': 'none',
    'class': 'mat-select',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-describedby]': 'ariaDescribedby || null',
    '[class.mat-select-disabled]': 'disabled',
    '[class.mat-select-invalid]': 'errorState',
    '[class.mat-select-required]': 'required',
    '[class.mat-select-empty]': 'empty',
    '(keydown)': 'handleKeydown($event)',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: SelectConvocatoriaComponent
    }
  ],
})
export class SelectConvocatoriaComponent extends SelectDialogComponent<SearchConvocatoriaModalComponent, IConvocatoria> {

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef,
    @Optional() @Inject(MAT_FORM_FIELD) parentFormField: MatFormField,
    @Self() @Optional() ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string,
    dialog: MatDialog) {

    super(changeDetectorRef, elementRef, parentFormField, ngControl, tabIndex, dialog, SearchConvocatoriaModalComponent);
  }

  get displayValue(): string {
    if (this.empty) {
      return '';
    }

    return `${this.value.titulo}`;
  }
}
