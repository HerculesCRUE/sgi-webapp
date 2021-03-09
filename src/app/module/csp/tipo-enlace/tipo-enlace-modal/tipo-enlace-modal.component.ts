import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ITipoEnlace } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
@Component({
  templateUrl: './tipo-enlace-modal.component.html',
  styleUrls: ['./tipo-enlace-modal.component.scss']
})
export class TipoEnlaceModalComponent implements OnInit {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;

  textSaveOrUpdate: string;

  constructor(
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoEnlaceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoEnlace: ITipoEnlace
  ) {
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    if (tipoEnlace.id) {
      this.tipoEnlace = { ...tipoEnlace };
      this.textSaveOrUpdate = MSG_ACEPTAR;
    } else {
      this.tipoEnlace = { activo: true } as ITipoEnlace;
      this.textSaveOrUpdate = MSG_ANADIR;
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.tipoEnlace?.nombre),
      descripcion: new FormControl(this.tipoEnlace?.descripcion)
    });
  }

  closeModal(tipoEnlace?: ITipoEnlace): void {
    this.matDialogRef.close(tipoEnlace);
  }

  saveOrUpdate(): void {
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.tipoEnlace);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private loadDatosForm(): void {
    this.tipoEnlace.nombre = this.formGroup.get('nombre').value;
    this.tipoEnlace.descripcion = this.formGroup.get('descripcion').value;
  }

}
