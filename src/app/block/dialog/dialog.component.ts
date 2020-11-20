import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NGXLogger } from 'ngx-logger';

export interface DialogData {
  message: string;
  params: {};
  ok: string;
  cancel: string;
}
@Component({
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

  message: string;
  params: {};
  cancelButtonText: string;
  continuarButtonText: string;

  constructor(
    protected logger: NGXLogger,
    @Inject(MAT_DIALOG_DATA) data: DialogData,
    private dialogRef: MatDialogRef<DialogComponent>
  ) {
    this.logger.debug(DialogComponent.name, 'constructor(protected logger: NGXLogger, private dialogRef: MatDialogRef<DialogComponent>');
    if (data) {
      this.message = data.message || '';
      this.params = data.params || {};
      this.cancelButtonText = data.cancel || '';
      this.continuarButtonText = data.ok || '';
    }
    this.logger.debug(DialogComponent.name, 'constructor(protected logger: NGXLogger, private dialogRef: MatDialogRef<DialogComponent>');
  }

  /**
   * Aceptar mensaje de confirmacion
   */
  confirmacionClick(): void {
    this.logger.debug(DialogComponent.name, 'confirmacionClick()', 'start');
    this.dialogRef.close(true);
    this.logger.debug(DialogComponent.name, 'confirmacionClick()', 'end');
  }

}

