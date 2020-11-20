import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IConvocatoriaPeriodoJustificacion, TipoJustificacion } from '@core/models/csp/convocatoria-periodo-justificacion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { DateValidator } from '@core/validators/date-validator';
import { NumberValidator } from '@core/validators/number-validator';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { RangeValidator } from '@core/validators/range-validator';
import { StringValidator } from '@core/validators/string-validator';

export interface IConvocatoriaPeriodoJustificacionModalData {
  duracion: number;
  convocatoriaPeriodoJustificacion: IConvocatoriaPeriodoJustificacion;
  convocatoriaPeriodoJustificacionList: StatusWrapper<IConvocatoriaPeriodoJustificacion>[];
}

@Component({
  templateUrl: './convocatoria-periodos-justificacion-modal.component.html',
  styleUrls: ['./convocatoria-periodos-justificacion-modal.component.scss']
})
export class ConvocatoriaPeriodosJustificacionModalComponent
  extends BaseModalComponent<IConvocatoriaPeriodoJustificacion, ConvocatoriaPeriodosJustificacionModalComponent> implements OnInit {

  fxFlexProperties2: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  FormGroupUtil = FormGroupUtil;

  tiposJustificacion: TipoJustificacion[];
  tiposJustificacionFiltered: Observable<TipoJustificacion[]>;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: IConvocatoriaPeriodoJustificacionModalData,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaPeriodosJustificacionModalComponent>
  ) {
    super(logger, snackBarService, matDialogRef, data.convocatoriaPeriodoJustificacion);
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, 'constructor()', 'start');

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(20%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexProperties2 = new FxFlexProperties();
    this.fxFlexProperties2.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, 'ngOnInit()', 'start');
    this.loadTiposJustificacion();
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, 'ngOnInit()', 'start');
  }

  protected getFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, `${this.getFormGroup.name}()`, 'start');

    const rangosPeriodosExistentes = this.data.convocatoriaPeriodoJustificacionList
      .filter(periodoJustificacion => periodoJustificacion.value.mesInicial !== this.data.convocatoriaPeriodoJustificacion.mesInicial)
      .map(periodoJustificacion => {
        return {
          inicio: periodoJustificacion.value.mesInicial,
          fin: periodoJustificacion.value.mesFinal
        };
      });

    const periodoJustificacionFinal = this.data.convocatoriaPeriodoJustificacionList
      .find(periodoJustificacion => periodoJustificacion.value.tipoJustificacion === TipoJustificacion.FINAL
        && periodoJustificacion.value.mesInicial !== this.data.convocatoriaPeriodoJustificacion.mesInicial);

    const ultimoPeriodoJustificacionNoFinal = this.data.convocatoriaPeriodoJustificacionList
      .filter(periodoJustificacion => periodoJustificacion.value.tipoJustificacion !== TipoJustificacion.FINAL
        && periodoJustificacion.value.mesInicial !== this.data.convocatoriaPeriodoJustificacion.mesInicial)
      .sort((a, b) => (b.value.mesInicial > a.value.mesInicial) ? 1 : ((a.value.mesInicial > b.value.mesInicial) ? -1 : 0)).find(c => true);

    const formGroup = new FormGroup({
      numPeriodo: new FormControl(this.data.convocatoriaPeriodoJustificacion?.numPeriodo, [Validators.required]),
      tipoJustificacion: new FormControl(this.data.convocatoriaPeriodoJustificacion?.tipoJustificacion, [Validators.required]),
      desdeMes: new FormControl(this.data.convocatoriaPeriodoJustificacion?.mesInicial, [Validators.required, Validators.min(1)]),
      hastaMes: new FormControl(this.data.convocatoriaPeriodoJustificacion?.mesFinal, [Validators.required, Validators.min(2)]),
      fechaInicio: new FormControl(this.data.convocatoriaPeriodoJustificacion?.fechaInicioPresentacion, []),
      fechaFin: new FormControl(this.data.convocatoriaPeriodoJustificacion?.fechaFinPresentacion, []),
      observaciones: new FormControl(this.data.convocatoriaPeriodoJustificacion?.observaciones, [Validators.maxLength(2000)])
    }, {
      validators: [
        this.isFinalUltimoPeriodo(ultimoPeriodoJustificacionNoFinal?.value.mesFinal),
        NumberValidator.isAfer('desdeMes', 'hastaMes'),
        RangeValidator.notOverlaps('desdeMes', 'hastaMes', rangosPeriodosExistentes),
        DateValidator.isAfter('fechaInicio', 'fechaFin')]
    });

    // Si ya existe un periodo final tiene que ser el ultimo y solo puede haber 1
    if (periodoJustificacionFinal) {
      formGroup.get('tipoJustificacion').setValidators([
        StringValidator.notIn([TipoJustificacion.FINAL]),
        formGroup.get('tipoJustificacion').validator
      ]);

      formGroup.get('desdeMes').setValidators([
        Validators.max(periodoJustificacionFinal.value.mesInicial),
        formGroup.get('desdeMes').validator
      ]);
    }

    // Si la convocatoria tiene duracion el mesFinal no puede superarla
    if (this.data.duracion) {
      formGroup.get('hastaMes').setValidators([
        Validators.max(this.data.duracion),
        formGroup.get('hastaMes').validator
      ]);
    }

    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, `${this.getFormGroup.name}()`, 'end');
    return formGroup;
  }

  protected getDatosForm(): IConvocatoriaPeriodoJustificacion {
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, `${this.getDatosForm.name}()`, 'start');

    const convocatoriaPeriodoJustificacion = this.data.convocatoriaPeriodoJustificacion;
    convocatoriaPeriodoJustificacion.numPeriodo = this.formGroup.get('numPeriodo').value;
    convocatoriaPeriodoJustificacion.tipoJustificacion = this.formGroup.get('tipoJustificacion').value;
    convocatoriaPeriodoJustificacion.mesInicial = this.formGroup.get('desdeMes').value;
    convocatoriaPeriodoJustificacion.mesFinal = this.formGroup.get('hastaMes').value;
    convocatoriaPeriodoJustificacion.fechaInicioPresentacion = this.formGroup.get('fechaInicio').value;
    convocatoriaPeriodoJustificacion.fechaFinPresentacion = this.formGroup.get('fechaFin').value;
    convocatoriaPeriodoJustificacion.observaciones = this.formGroup.get('observaciones').value;

    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, `${this.getDatosForm.name}()`, 'end');
    return convocatoriaPeriodoJustificacion;
  }


  /**
   * Carga los tipos de justificacion del enum TipoJustificacion
   */
  loadTiposJustificacion() {
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, 'loadTiposJustificacion()', 'start');
    this.tiposJustificacion = Object.keys(TipoJustificacion).map(key => TipoJustificacion[key]);
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name, 'loadTiposJustificacion()', 'end');
  }

  /**
   * Recalcula el numero de periodo en funcion de la ordenacion por mes inicial de todos los periodos.
   */
  recalcularNumPeriodo(): void {
    let numPeriodo = 1;
    const mesInicial = this.formGroup.get('desdeMes').value;

    this.data.convocatoriaPeriodoJustificacionList.forEach(c => {
      if (mesInicial > c.value.mesInicial) {
        numPeriodo++;
      }
    });

    this.formGroup.get('numPeriodo').setValue(numPeriodo);
  }

  /**
   * Comprueba que si el periodo es tipo final sea el ultimo (empiza despues del ultimo periodo no final).
   *
   * @param mesFinUltimoPeriodoNoFinal Mes de fin del ultimo periodo que no es de tipo final.
   */
  private isFinalUltimoPeriodo(mesFinUltimoPeriodoNoFinal: number): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const tipoJustificacionControl = formGroup.controls.tipoJustificacion;
      const mesInicioControl = formGroup.controls.desdeMes;

      if (!mesFinUltimoPeriodoNoFinal || (tipoJustificacionControl.errors && !tipoJustificacionControl.errors.finalNotLast)
        || (mesInicioControl.errors && !mesInicioControl.errors.finalNotLast)) {
        return;
      }

      const mesInicioNumber = mesInicioControl.value;
      const tipoJustificacionValue = tipoJustificacionControl.value;

      if (tipoJustificacionValue === TipoJustificacion.FINAL && mesInicioNumber < mesFinUltimoPeriodoNoFinal) {
        tipoJustificacionControl.setErrors({ finalNotLast: true });
        tipoJustificacionControl.markAsTouched({ onlySelf: true });
      } else if (tipoJustificacionControl.errors) {
        delete tipoJustificacionControl.errors.finalNotLast;
        tipoJustificacionControl.updateValueAndValidity({ onlySelf: true });
      }
    };
  }


}
