import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { SnackBarService } from '@core/services/snack-bar.service';


const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
@Component({
  templateUrl: './tipo-finalidad-modal.component.html',
  styleUrls: ['./tipo-finalidad-modal.component.scss']
})
export class TipoFinalidadModalComponent extends BaseModalComponent<ITipoFinalidad, TipoFinalidadModalComponent> implements OnInit {

  textSaveOrUpdate: string;

  constructor(
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoFinalidadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoFinalidad: ITipoFinalidad
  ) {
    super(snackBarService, matDialogRef, tipoFinalidad);
    if (tipoFinalidad.id) {
      this.tipoFinalidad = { ...tipoFinalidad };
      this.textSaveOrUpdate = MSG_ACEPTAR;
    } else {
      this.tipoFinalidad = { activo: true } as ITipoFinalidad;
      this.textSaveOrUpdate = MSG_ANADIR;
    }
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  protected getDatosForm(): ITipoFinalidad {
    const tipoFinalidad = this.tipoFinalidad;
    tipoFinalidad.nombre = this.formGroup.get('nombre').value;
    tipoFinalidad.descripcion = this.formGroup.get('descripcion').value;
    return tipoFinalidad;
  }

  protected getFormGroup(): FormGroup {
    return new FormGroup({
      nombre: new FormControl(this.tipoFinalidad?.nombre),
      descripcion: new FormControl(this.tipoFinalidad?.descripcion)
    });
  }

}
