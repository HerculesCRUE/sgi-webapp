import { Inject, OnDestroy, OnInit, Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { Subscription } from 'rxjs';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class BaseModalComponent<T, U> implements OnInit, OnDestroy {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  protected subscriptions: Subscription[] = [];

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<U>,
    @Inject(MAT_DIALOG_DATA) public entity: T
  ) {
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
  }

  ngOnInit(): void {
    this.formGroup = this.getFormGroup();
  }

  /**
   * Close the modal and return the entity data
   *
   * @param entity Entity
   */
  closeModal(entity?: T): void {
    this.matDialogRef.close(entity);
  }

  /**
   * Checks the formGroup, returns the entered data and closes the modal
   */
  saveOrUpdate(): void {
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
  }

  /**
   * Update the entity with the data from the formGroup
   */
  protected abstract getDatosForm(): T;

  /**
   * Initialize the formGroup that the modal will use
   */
  protected abstract getFormGroup(): FormGroup;

  ngOnDestroy(): void {
    this.subscriptions?.forEach(x => x.unsubscribe());
  }
}
