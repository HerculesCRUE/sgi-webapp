import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogComponent, DialogData } from '../../block/dialog/dialog.component';

const MSG_BUTTON_OK = marker('botones.aceptar');
const MSG_BUTTON_CANCEL = marker('botones.cancelar');

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {
  }

  showConfirmation(
    message: string,
    params: {} = {},
    ok: string = MSG_BUTTON_OK,
    cancel: string = MSG_BUTTON_CANCEL
  ): Observable<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      ...this.dialog,
      data: {
        message,
        params,
        ok,
        cancel
      } as DialogData,
      panelClass: 'confirmacion-dialog'
    });

    return dialogRef.afterClosed().pipe(
      map((confirmed: boolean) => confirmed ? confirmed : false)
    );
  }
}
