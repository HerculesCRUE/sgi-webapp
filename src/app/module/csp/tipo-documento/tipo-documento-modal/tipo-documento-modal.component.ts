import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { ITipoDocumento } from '@core/models/csp/tipos-configuracion';
import { SnackBarService } from '@core/services/snack-bar.service';

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
@Component({
  templateUrl: './tipo-documento-modal.component.html',
  styleUrls: ['./tipo-documento-modal.component.scss']
})
export class TipoDocumentoModalComponent extends BaseModalComponent<ITipoDocumento, TipoDocumentoModalComponent> implements OnInit {

  textSaveOrUpdate: string;

  constructor(
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoDocumentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoDocumento: ITipoDocumento
  ) {
    super(snackBarService, matDialogRef, tipoDocumento);
    if (tipoDocumento.id) {
      this.tipoDocumento = { ...tipoDocumento };
      this.textSaveOrUpdate = MSG_ACEPTAR;
    } else {
      this.tipoDocumento = { activo: true } as ITipoDocumento;
      this.textSaveOrUpdate = MSG_ANADIR;
    }
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  protected getDatosForm(): ITipoDocumento {
    const tipoDocumento = this.tipoDocumento;
    tipoDocumento.nombre = this.formGroup.get('nombre').value;
    tipoDocumento.descripcion = this.formGroup.get('descripcion').value;
    return tipoDocumento;
  }

  protected getFormGroup(): FormGroup {
    return new FormGroup({
      nombre: new FormControl(this.tipoDocumento?.nombre),
      descripcion: new FormControl(this.tipoDocumento?.descripcion)
    });
  }
}
