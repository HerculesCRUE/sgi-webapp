import { Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');

export abstract class BaseModalComponent<T, U> implements OnInit, OnDestroy {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  protected subscriptions: Subscription[] = [];

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<U>,
    @Inject(MAT_DIALOG_DATA) public entity: T
  ) {
    this.logger.debug(BaseModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.logger.debug(BaseModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(BaseModalComponent.name, 'ngOnInit()', 'start');
    this.formGroup = this.getFormGroup();
    this.logger.debug(BaseModalComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Close the modal and return the entity data
   *
   * @param entity Entity
   */
  closeModal(entity?: T): void {
    this.logger.debug(BaseModalComponent.name, `${this.closeModal.name}(entity : ${entity})`, 'start');
    this.matDialogRef.close(entity);
    this.logger.debug(BaseModalComponent.name, `${this.closeModal.name}(entity : ${entity})`, 'end');
  }

  /**
   * Checks the formGroup, returns the entered data and closes the modal
   */
  saveOrUpdate(): void {
    this.logger.debug(BaseModalComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(BaseModalComponent.name, `${this.saveOrUpdate.name}()`, 'end');
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
    this.logger.debug(BaseModalComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(BaseModalComponent.name, 'ngOnDestroy()', 'end');
  }
}
