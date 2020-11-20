import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IAsistente } from '@core/models/eti/asistente';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Subscription } from 'rxjs';
import { AsistenteService } from '@core/services/eti/asistente.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const MSG_SUCCESS = marker('eti.acta.asistentes.correcto');
const MSG_ERROR = marker('eti.acta.asistentes.error');
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
    private readonly logger: NGXLogger,
    public readonly matDialogRef: MatDialogRef<ActaAsistentesEditarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public asistente: IAsistente,
    private readonly snackBarService: SnackBarService
  ) {
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'ngOnInit()', 'start');

    this.initFormGroup();

    this.activarMotivo(this.asistente.asistencia);

    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'ngOnInit()', 'end');

  }

  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'initFormGroup()', 'start');
    this.formGroup = new FormGroup({
      asistente: new FormControl(this.asistente?.evaluador?.nombre + ' ' + this.asistente?.evaluador?.primerApellido
        + ' ' + this.asistente?.evaluador?.segundoApellido, [Validators.required]),
      asistencia: new FormControl(this.asistente.asistencia, [Validators.required]),
      motivo: new FormControl(this.asistente.motivo),
    });
    this.formGroup.controls.asistente.disable();
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'initFormGroup()', 'end');
  }

  /**
   * Cierra la ventana modal y devuelve el asistencia si se ha modificado
   *
   * @param asistente asistencia modificada
   */
  closeModal(asistente?: IAsistente): void {
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(asistente);
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'closeModal()', 'end');
  }

  /**
   * Comprueba el formulario y envia el asistente resultante
   */
  editComentario() {
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'editComentario()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM);
    }
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'editComentario()', 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private getDatosForm(): IAsistente {
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'getDatosForm()', 'start');
    const asistente = this.asistente;
    if (this.ocultarMotivo) {
      this.formGroup.controls.motivo.setValue('');
      asistente.motivo = '';
    } else {
      asistente.motivo = FormGroupUtil.getValue(this.formGroup, 'motivo');
    }
    asistente.asistencia = FormGroupUtil.getValue(this.formGroup, 'asistencia');
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'getDatosForm()', 'end');
    return asistente;
  }

  /**
   * Recupera el valor de la asistencia
   * @param value valor del radio button seleccionado.
   */
  activarMotivo(value: boolean): void {
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'activarMotivo(value: string)', 'start');
    if (value) {
      this.ocultarMotivo = true;
    } else {
      this.ocultarMotivo = false;
    }
    this.logger.debug(ActaAsistentesEditarModalComponent.name, 'activarMotivo(value: string)', 'end');
  }
}
