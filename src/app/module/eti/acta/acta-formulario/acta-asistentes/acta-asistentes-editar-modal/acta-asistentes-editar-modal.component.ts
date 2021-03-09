import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IAsistente } from '@core/models/eti/asistente';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';


const MSG_ERROR_FORM = marker('form-group.error');

@Component({
  templateUrl: './acta-asistentes-editar-modal.component.html',
  styleUrls: ['./acta-asistentes-editar-modal.component.scss']
})
export class ActaAsistentesEditarModalComponent implements OnInit {

  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;

  ocultarMotivo: boolean;

  estados =
    [
      { label: 'Sí', value: true },
      { label: 'No', value: false }
    ];

  constructor(
    public readonly matDialogRef: MatDialogRef<ActaAsistentesEditarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public asistente: IAsistente,
    private readonly snackBarService: SnackBarService
  ) {
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
  }

  ngOnInit(): void {
    this.initFormGroup();

    this.activarMotivo(this.asistente.asistencia);
  }

  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.formGroup = new FormGroup({
      asistente: new FormControl(this.asistente?.evaluador?.nombre + ' ' + this.asistente?.evaluador?.primerApellido
        + ' ' + this.asistente?.evaluador?.segundoApellido, [Validators.required]),
      asistencia: new FormControl(this.asistente.asistencia, [Validators.required]),
      motivo: new FormControl(this.asistente.motivo),
    });
    this.formGroup.controls.asistente.disable();
  }

  /**
   * Cierra la ventana modal y devuelve el asistencia si se ha modificado
   *
   * @param asistente asistencia modificada
   */
  closeModal(asistente?: IAsistente): void {
    this.matDialogRef.close(asistente);
  }

  /**
   * Comprueba el formulario y envia el asistente resultante
   */
  editComentario() {
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM);
    }
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private getDatosForm(): IAsistente {
    const asistente = this.asistente;
    if (this.ocultarMotivo) {
      this.formGroup.controls.motivo.setValue('');
      asistente.motivo = '';
    } else {
      asistente.motivo = FormGroupUtil.getValue(this.formGroup, 'motivo');
    }
    asistente.asistencia = FormGroupUtil.getValue(this.formGroup, 'asistencia');
    return asistente;
  }

  /**
   * Recupera el valor de la asistencia
   * @param value valor del radio button seleccionado.
   */
  activarMotivo(value: boolean): void {
    if (value) {
      this.ocultarMotivo = true;
    } else {
      this.ocultarMotivo = false;
    }
  }
}
