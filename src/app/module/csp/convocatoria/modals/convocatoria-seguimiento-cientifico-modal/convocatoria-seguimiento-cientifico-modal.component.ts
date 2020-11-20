import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IConvocatoriaSeguimientoCientifico } from '@core/models/csp/convocatoria-seguimiento-cientifico';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { DateValidator } from '@core/validators/date-validator';
import { NumberValidator } from '@core/validators/number-validator';
import { RangeValidator } from '@core/validators/range-validator';
import { NGXLogger } from 'ngx-logger';

export interface IConvocatoriaSeguimientoCientificoModalData {
  duracion: number;
  convocatoriaSeguimientoCientifico: IConvocatoriaSeguimientoCientifico;
  convocatoriaSeguimientoCientificoList: StatusWrapper<IConvocatoriaSeguimientoCientifico>[];
}

@Component({
  templateUrl: './convocatoria-seguimiento-cientifico-modal.component.html',
  styleUrls: ['./convocatoria-seguimiento-cientifico-modal.component.scss']
})
export class ConvocatoriaSeguimientoCientificoModalComponent
  extends BaseModalComponent<IConvocatoriaSeguimientoCientifico, ConvocatoriaSeguimientoCientificoModalComponent> implements OnInit {

  fxFlexProperties2: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  FormGroupUtil = FormGroupUtil;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: IConvocatoriaSeguimientoCientificoModalData,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaSeguimientoCientificoModalComponent>
  ) {
    super(logger, snackBarService, matDialogRef, data.convocatoriaSeguimientoCientifico);
    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, 'constructor()', 'start');

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

    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, 'ngOnInit()', 'start');
  }

  protected getFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, `${this.getFormGroup.name}()`, 'start');

    const rangosPeriodosExistentes = this.data.convocatoriaSeguimientoCientificoList
      .filter(seguimientoCientifico => seguimientoCientifico.value?.mesInicial !== this.data.convocatoriaSeguimientoCientifico?.mesInicial)
      .map(seguimientoCientifico => {
        return {
          inicio: seguimientoCientifico.value.mesInicial,
          fin: seguimientoCientifico.value.mesFinal
        };
      });

    const ultimoseguimientoCientificoNoFinal = this.data.convocatoriaSeguimientoCientificoList
      .filter(seguimientoCientifico => seguimientoCientifico.value.mesInicial !== this.data.convocatoriaSeguimientoCientifico.mesInicial)
      .sort((a, b) => (b.value.mesInicial > a.value.mesInicial) ? 1 : ((a.value.mesInicial > b.value.mesInicial) ? -1 : 0)).find(c => true);

    const formGroup = new FormGroup({
      numPeriodo: new FormControl(this.data.convocatoriaSeguimientoCientifico?.numPeriodo),
      desdeMes: new FormControl(this.data.convocatoriaSeguimientoCientifico?.mesInicial, [Validators.required, Validators.min(1)]),
      hastaMes: new FormControl(this.data.convocatoriaSeguimientoCientifico?.mesFinal, [Validators.required, Validators.min(2)]),
      fechaInicio: new FormControl(this.data.convocatoriaSeguimientoCientifico?.fechaInicioPresentacion, []),
      fechaFin: new FormControl(this.data.convocatoriaSeguimientoCientifico?.fechaFinPresentacion, []),
      observaciones: new FormControl(this.data.convocatoriaSeguimientoCientifico?.observaciones, [Validators.maxLength(2000)])
    }, {
      validators: [
        this.isFinalUltimoPeriodo(ultimoseguimientoCientificoNoFinal?.value.mesFinal),
        NumberValidator.isAfer('desdeMes', 'hastaMes'),
        RangeValidator.notOverlaps('desdeMes', 'hastaMes', rangosPeriodosExistentes),
        DateValidator.isAfter('fechaInicio', 'fechaFin')]
    });

    // Si la convocatoria tiene duracion el mesFinal no puede superarla
    if (this.data.duracion) {
      formGroup.get('hastaMes').setValidators([
        Validators.max(this.data.duracion),
        formGroup.get('hastaMes').validator
      ]);
    }

    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, `${this.getFormGroup.name}()`, 'end');
    return formGroup;
  }

  protected getDatosForm(): IConvocatoriaSeguimientoCientifico {
    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, `${this.getDatosForm.name}()`, 'start');
    const convocatoriaSeguimientoCientifico = this.data.convocatoriaSeguimientoCientifico;
    convocatoriaSeguimientoCientifico.numPeriodo = this.formGroup.get('numPeriodo').value;
    convocatoriaSeguimientoCientifico.mesInicial = this.formGroup.get('desdeMes').value;
    convocatoriaSeguimientoCientifico.mesFinal = this.formGroup.get('hastaMes').value;
    convocatoriaSeguimientoCientifico.fechaInicioPresentacion = this.formGroup.get('fechaInicio').value;
    convocatoriaSeguimientoCientifico.fechaFinPresentacion = this.formGroup.get('fechaFin').value;
    convocatoriaSeguimientoCientifico.observaciones = this.formGroup.get('observaciones').value;
    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name, `${this.getDatosForm.name}()`, 'end');
    return convocatoriaSeguimientoCientifico;
  }

  /**
   * Recalcula el numero de periodo en funcion de la ordenacion por mes inicial de todos los periodos.
   */
  recalcularNumPeriodo(): void {
    let numPeriodo = 1;
    const mesInicial = this.formGroup.get('desdeMes').value;

    this.data.convocatoriaSeguimientoCientificoList.forEach(c => {
      if (mesInicial > c.value.mesInicial) {
        numPeriodo++;
      }
    });

    this.formGroup.get('numPeriodo').setValue(numPeriodo);
  }

  /**
   * Comprueba el mes sea el ultimo (empieza despues del ultimo periodo no final).
   *
   * @param mesFinUltimoPeriodoNoFinal Mes de fin del ultimo periodo que no es de tipo final.
   */
  private isFinalUltimoPeriodo(mesFinUltimoPeriodoNoFinal: number): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const mesInicioControl = formGroup.controls.desdeMes;

      if (!mesFinUltimoPeriodoNoFinal || (mesInicioControl.errors && !mesInicioControl.errors.finalNotLast)) {
        return;
      }

    };
  }


}
