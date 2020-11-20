import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackBarComponent, SnackBarData } from '../../block/snack-bar/snack-bar.component';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  snackBarConfig: MatSnackBarConfig;

  constructor(
    protected logger: NGXLogger,
    private snackBar: MatSnackBar,
  ) {
    this.logger.debug(
      SnackBarService.name,
      'constructor(protected logger: NGXLogger, private snackBar: MatSnackBar)',
      'start'
    );
    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 4000;
    this.snackBarConfig.verticalPosition = 'top';

    this.logger.debug(
      SnackBarService.name,
      'constructor(protected logger: NGXLogger, private snackBar: MatSnackBar)',
      'end'
    );
  }

  private open(msg: string, params: {}, cssClass: string): void {
    this.snackBar.openFromComponent(SnackBarComponent, {
      ...this.snackBarConfig,
      data: {
        msg,
        params
      } as SnackBarData,
      panelClass: cssClass,
    });
  }

  /**
   * Muestra un mensaje de error.
   *
   * @param mensaje el mensaje o lista de mensajes de error.
   */
  showError(msg: string, params: {} = {}): void {
    this.open(msg, params, 'error-snack-bar');
  }

  /**
   * Muestra un mensaje de exito.
   *
   * @param mensaje el mensaje.
   */
  showSuccess(msg: string, params: {} = {}): void {
    this.open(msg, params, 'success-snack-bar');
  }
}
