import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';

import { MatDialog } from '@angular/material/dialog';
import { IPersona } from '@core/models/sgp/persona';
import { BuscarPersonaDialogoComponent } from '@shared/buscar-persona/dialogo/buscar-persona-dialogo.component';
import { SelectDialogComponent } from '@core/component/select-dialog/select-dialog.component';

@Component({
  selector: 'sgi-select-persona',
  templateUrl: '../../core/component/select-dialog/select-dialog.component.html',
  styleUrls: ['../../core/component/select-dialog/select-dialog.component.scss'],
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
      useExisting: SelectPersonaComponent
    }
  ],
})
export class SelectPersonaComponent extends SelectDialogComponent<BuscarPersonaDialogoComponent, IPersona> {

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef,
    @Optional() @Inject(MAT_FORM_FIELD) parentFormField: MatFormField,
    @Self() @Optional() ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string,
    dialog: MatDialog) {

    super(changeDetectorRef, elementRef, parentFormField, ngControl, tabIndex, dialog, BuscarPersonaDialogoComponent);
  }

  get displayValue(): string {
    if (this.empty) {
      return '';
    }

    return `${this.value.nombre} ${this.value.primerApellido} ${this.value.segundoApellido} (${this.value.identificadorNumero}${this.value.identificadorLetra})`;
  }
}
