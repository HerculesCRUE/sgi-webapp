import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
@Component({
  selector: 'sgi-tipo-fase-modal',
  templateUrl: './tipo-fase-modal.component.html',
  styleUrls: ['./tipo-fase-modal.component.scss']
})
export class TipoFaseModalComponent implements OnInit {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;

  textSaveOrUpdate: string;

  constructor(
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoFaseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoFase: ITipoFase
  ) {
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    if (tipoFase.id) {
      this.tipoFase = { ...tipoFase };
      this.textSaveOrUpdate = MSG_ACEPTAR;
    } else {
      this.tipoFase = { activo: true } as ITipoFase;
      this.textSaveOrUpdate = MSG_ANADIR;
    }
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.tipoFase?.nombre),
      descripcion: new FormControl(this.tipoFase?.descripcion)
    });
  }

  closeModal(tipoFase?: ITipoFase): void {
    this.matDialogRef.close(tipoFase);
  }

  saveOrUpdate(): void {
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.tipoFase);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private loadDatosForm(): void {
    this.tipoFase.nombre = this.formGroup.get('nombre').value;
    this.tipoFase.descripcion = this.formGroup.get('descripcion').value;
  }

}

