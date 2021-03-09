import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { ISolicitudProyectoPeriodoJustificacion } from '@core/models/csp/solicitud-proyecto-periodo-justificacion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { NumberValidator } from '@core/validators/number-validator';
import { IRange, RangeValidator } from '@core/validators/range-validator';

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

export interface SolicitudProyectoPeriodoJustificacionesModalData {
  periodoJustificacion: ISolicitudProyectoPeriodoJustificacion;
  selectedPeriodoJustificaciones: ISolicitudProyectoPeriodoJustificacion[];
  mesInicioSolicitudProyectoSocio: number;
  mesFinSolicitudProyectoSocio: number;
  isEdit: boolean;
  readonly: boolean;
}

@Component({
  templateUrl: './solicitud-proyecto-periodo-justificaciones-modal.component.html',
  styleUrls: ['./solicitud-proyecto-periodo-justificaciones-modal.component.scss']
})
export class SolicitudProyectoPeriodoJustificacionesModalComponent extends
  BaseModalComponent<SolicitudProyectoPeriodoJustificacionesModalData, SolicitudProyectoPeriodoJustificacionesModalComponent>
  implements OnInit {
  textSaveOrUpdate: string;

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<SolicitudProyectoPeriodoJustificacionesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SolicitudProyectoPeriodoJustificacionesModalData,
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
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.textSaveOrUpdate = this.data.isEdit ? MSG_ACEPTAR : MSG_ANADIR;
  }

  protected getFormGroup(): FormGroup {
    const solicitudProyectoSocio = this.data.periodoJustificacion.solicitudProyectoSocio;
    const rangosPeriodosExistentes = this.data.selectedPeriodoJustificaciones?.map(
      periodoJustificacion => {
        const value: IRange = {
          inicio: periodoJustificacion.mesInicial,
          fin: periodoJustificacion.mesFinal
        };
        return value;
      }
    );
    const mesInicio = this.data.mesInicioSolicitudProyectoSocio;
    const mesFinal = this.data.mesFinSolicitudProyectoSocio;
    const duracion = solicitudProyectoSocio?.solicitudProyectoDatos?.duracion;
    const formGroup = new FormGroup(
      {
        nombre: new FormControl({
          value: solicitudProyectoSocio?.empresa?.razonSocial,
          disabled: true
        }),
        numPeriodo: new FormControl({
          value: this.data.periodoJustificacion.numPeriodo,
          disabled: true
        }),
        mesInicial: new FormControl(this.data.periodoJustificacion.mesInicial, [
          Validators.required,
          Validators.min(mesInicio ? mesInicio : 1),
          Validators.max(mesFinal ? mesFinal : (isNaN(duracion) ? GLOBAL_CONSTANTS.integerMaxValue : duracion)),
        ]),
        mesFinal: new FormControl(this.data.periodoJustificacion.mesFinal, [
          Validators.required,
          Validators.min(1),
          Validators.max(mesFinal ? mesFinal : (isNaN(duracion) ? GLOBAL_CONSTANTS.integerMaxValue : duracion)),
        ]),
        fechaInicio: new FormControl(this.data.periodoJustificacion.fechaInicio, []),
        fechaFin: new FormControl(this.data.periodoJustificacion.fechaFin, []),
        observaciones: new FormControl(this.data.periodoJustificacion.observaciones, [Validators.maxLength(2000)]),
      },
      {
        validators: [
          NumberValidator.isAfter('mesInicial', 'mesFinal'),
          NumberValidator.isAfter('fechaInicio', 'fechaFin'),
          RangeValidator.notOverlaps('mesInicial', 'mesFinal', rangosPeriodosExistentes)
        ]
      }
    );

    if (this.data.readonly) {
      this.formGroup.disable();
    }

    return formGroup;
  }

  protected getDatosForm(): SolicitudProyectoPeriodoJustificacionesModalData {
    this.data.periodoJustificacion.mesInicial = this.formGroup.get('mesInicial').value;
    this.data.periodoJustificacion.mesFinal = this.formGroup.get('mesFinal').value;
    this.data.periodoJustificacion.fechaInicio = this.formGroup.get('fechaInicio').value;
    this.data.periodoJustificacion.fechaFin = this.formGroup.get('fechaFin').value;
    this.data.periodoJustificacion.observaciones = this.formGroup.get('observaciones').value;
    return this.data;
  }
}
