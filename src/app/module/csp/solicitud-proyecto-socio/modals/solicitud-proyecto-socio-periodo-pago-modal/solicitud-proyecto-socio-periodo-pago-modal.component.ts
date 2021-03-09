import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { ISolicitudProyectoPeriodoPago } from '@core/models/csp/solicitud-proyecto-periodo-pago';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { RangeValidator } from '@core/validators/range-validator';

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

export interface SolicitudProyectoSocioPeriodoPagoModalData {
  solicitudProyectoPeriodoPago: ISolicitudProyectoPeriodoPago;
  selectedMeses: number[];
  mesInicioSolicitudProyectoSocio: number;
  mesFinSolicitudProyectoSocio: number;
  isEdit: boolean;
  readonly: boolean;
}

@Component({
  templateUrl: './solicitud-proyecto-socio-periodo-pago-modal.component.html',
  styleUrls: ['./solicitud-proyecto-socio-periodo-pago-modal.component.scss']
})
export class SolicitudProyectoSocioPeriodoPagoModalComponent extends
  BaseModalComponent<SolicitudProyectoSocioPeriodoPagoModalData, SolicitudProyectoSocioPeriodoPagoModalComponent>
  implements OnInit {
  textSaveOrUpdate: string;

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<SolicitudProyectoSocioPeriodoPagoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SolicitudProyectoSocioPeriodoPagoModalData,
  ) {
    super(snackBarService, matDialogRef, data);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.xs = 'row';
    this.textSaveOrUpdate = this.data.isEdit ? MSG_ACEPTAR : MSG_ANADIR;
  }

  protected getDatosForm(): SolicitudProyectoSocioPeriodoPagoModalData {
    this.data.solicitudProyectoPeriodoPago.numPeriodo = this.formGroup.get('numPeriodo').value;
    this.data.solicitudProyectoPeriodoPago.mes = this.formGroup.get('mes').value;
    this.data.solicitudProyectoPeriodoPago.importe = this.formGroup.get('importe').value;
    return this.data;
  }

  protected getFormGroup(): FormGroup {
    const mesInicio = this.data.mesInicioSolicitudProyectoSocio;
    const mesFinal = this.data.mesFinSolicitudProyectoSocio;
    const duracion = this.data.solicitudProyectoPeriodoPago?.solicitudProyectoSocio?.solicitudProyectoDatos?.duracion;
    const formGroup = new FormGroup(
      {
        numPeriodo: new FormControl({
          value: this.data.solicitudProyectoPeriodoPago.numPeriodo,
          disabled: true
        },
          [Validators.required]
        ),
        mes: new FormControl(
          this.data.solicitudProyectoPeriodoPago.mes,
          [
            Validators.min(mesInicio ? mesInicio : 1),
            Validators.max(mesFinal ? mesFinal : (isNaN(duracion) ? GLOBAL_CONSTANTS.integerMaxValue : duracion)),
            Validators.required,
            RangeValidator.contains(this.data.selectedMeses)
          ]
        ),
        importe: new FormControl(
          this.data.solicitudProyectoPeriodoPago.importe,
          [
            Validators.min(1),
            Validators.max(GLOBAL_CONSTANTS.integerMaxValue)
          ]
        ),
      }
    );

    if (this.data.readonly) {
      formGroup.disable();
    }

    return formGroup;
  }
}
