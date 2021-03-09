import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IProyectoSocioPeriodoPago } from '@core/models/csp/proyecto-socio-periodo-pago';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateValidator } from '@core/validators/date-validator';

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

export interface ProyectoSocioPeriodoPagoModalData {
  proyectoSocioPeriodoPago: IProyectoSocioPeriodoPago;
  selectedFechaPrevistas: Date[];
  fechaInicioProyectoSocio: Date;
  fechaFinProyectoSocio: Date;
  isEdit: boolean;
}

@Component({
  templateUrl: './proyecto-socio-periodo-pago-modal.component.html',
  styleUrls: ['./proyecto-socio-periodo-pago-modal.component.scss']
})
export class ProyectoSocioPeriodoPagoModalComponent extends
  BaseModalComponent<ProyectoSocioPeriodoPagoModalData, ProyectoSocioPeriodoPagoModalComponent>
  implements OnInit {
  textSaveOrUpdate: string;

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ProyectoSocioPeriodoPagoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProyectoSocioPeriodoPagoModalData,
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

  protected getDatosForm(): ProyectoSocioPeriodoPagoModalData {
    this.data.proyectoSocioPeriodoPago.numPeriodo = this.formGroup.get('numPeriodo').value;
    this.data.proyectoSocioPeriodoPago.fechaPrevistaPago = this.formGroup.get('fechaPrevistaPago').value;
    this.data.proyectoSocioPeriodoPago.importe = this.formGroup.get('importe').value;
    this.data.proyectoSocioPeriodoPago.fechaPago = this.formGroup.get('fechaPago').value;
    return this.data;
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup(
      {
        numPeriodo: new FormControl({
          value: this.data.proyectoSocioPeriodoPago.numPeriodo,
          disabled: true
        },
          [Validators.required]
        ),
        fechaPrevistaPago: new FormControl(
          this.data.proyectoSocioPeriodoPago.fechaPrevistaPago, [
          Validators.required,
          DateValidator.minDate(this.data.fechaInicioProyectoSocio),
          DateValidator.maxDate(this.data.fechaFinProyectoSocio)
        ]
        ),
        importe: new FormControl(
          this.data.proyectoSocioPeriodoPago.importe,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(2_147_483_647)
          ]
        ),
        fechaPago: new FormControl(this.data.proyectoSocioPeriodoPago.fechaPago, []),
      }
    );
    return formGroup;
  }
}
