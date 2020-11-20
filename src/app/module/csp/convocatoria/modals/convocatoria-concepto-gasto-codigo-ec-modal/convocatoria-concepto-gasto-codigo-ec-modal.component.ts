import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { CodigoEconomicoService } from '@core/services/sge/codigo-economico.service';
import { ICodigoEconomico } from '@core/models/sge/codigo-economico';
import { SgiRestListResult } from '@sgi/framework/http/types';
import { DateValidator } from '@core/validators/date-validator';
import { SelectValidator } from '@core/validators/select-validator';
import { DateUtils } from '@core/utils/date-utils';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ERROR_INIT = marker('csp.convocatoria.concepto-gasto-codigo-ec.error.cargar');
const MSG_ERROR_CONCEPTO_GASTO_REPETIDO = marker('csp.convocatoria.concepto-gasto-codigo-ec.modal.repetido');


export interface IConvocatoriaConceptoGastoCodigoEcModalComponent {
  convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc;
  convocatoriaConceptoGastoCodigoEcsTabla: IConvocatoriaConceptoGastoCodigoEc[];
  convocatoriaConceptoGastos: IConvocatoriaConceptoGasto[];
  editModal: boolean;
}

@Component({
  templateUrl: './convocatoria-concepto-gasto-codigo-ec-modal.component.html',
  styleUrls: ['./convocatoria-concepto-gasto-codigo-ec-modal.component.scss']
})
export class ConvocatoriaConceptoGastoCodigoEcModalComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  private suscripciones: Subscription[];

  convocatoriaConceptoGastosFiltered: IConvocatoriaConceptoGasto[];
  convocatoriaConceptoGastos$: Observable<IConvocatoriaConceptoGasto[]>;

  codigosEconomicosFiltered: ICodigoEconomico[];
  codigosEconomicos$: Observable<ICodigoEconomico[]>;

  constructor(
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaConceptoGastoCodigoEcModalComponent>,
    private readonly codigoEconomicoService: CodigoEconomicoService,
    @Inject(MAT_DIALOG_DATA) private data: IConvocatoriaConceptoGastoCodigoEcModalComponent
  ) {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.xs = 'column';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'ngOnInit()', 'start');
    this.suscripciones = [];
    this.initFormGroup();
    this.loadConceptoGastos();
    this.loadCodigosEconomicos();
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'ngOnInit()', 'end');
  }

  private initFormGroup() {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'initFormGroup()', 'start');
    this.formGroup = new FormGroup({
      convocatoriaConceptoGasto: new FormControl(this.data.editModal ?
        this.data.convocatoriaConceptoGastoCodigoEc?.convocatoriaConceptoGasto : null, [SelectValidator.isSelectOption(
          this.data.convocatoriaConceptoGastos.map(conv => conv.conceptoGasto.nombre), true)]),
      codigoEconomicoRef: new FormControl(
        this.data.convocatoriaConceptoGastoCodigoEc?.codigoEconomicoRef),
      fechaInicio: new FormControl(
        this.data.convocatoriaConceptoGastoCodigoEc?.fechaInicio),
      fechaFin: new FormControl(
        this.data.convocatoriaConceptoGastoCodigoEc?.fechaFin),
      observaciones: new FormControl(this.data.convocatoriaConceptoGastoCodigoEc?.observaciones),
    },
      {
        validators: [
          DateValidator.isAfter('fechaInicio', 'fechaFin')]
      });
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'initFormGroup()', 'end');
  }

  private loadConceptoGastos() {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'loadConceptoGastos()', 'start');
    this.convocatoriaConceptoGastosFiltered = this.data.convocatoriaConceptoGastos;
    this.convocatoriaConceptoGastos$ = this.formGroup.controls.convocatoriaConceptoGasto.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filtroConvocatoriaConceptoGasto(value))
      );
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'loadConceptoGastos()', 'end');
  }

  filtroConvocatoriaConceptoGasto(value: string): IConvocatoriaConceptoGasto[] {
    const filterValue = value.toString().toLowerCase();
    return this.convocatoriaConceptoGastosFiltered.filter(convocatoriaGasto =>
      convocatoriaGasto.conceptoGasto.nombre.toLowerCase().includes(filterValue));
  }

  getNombreConceptoGasto(convocatoriaConceptoGastoconceptoGasto?: IConvocatoriaConceptoGasto): string | undefined {
    return typeof convocatoriaConceptoGastoconceptoGasto === 'string' ?
      convocatoriaConceptoGastoconceptoGasto : convocatoriaConceptoGastoconceptoGasto?.conceptoGasto?.nombre;
  }

  private loadCodigosEconomicos() {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'loadCodigosEconomicos()', 'start');
    const subscription = this.codigoEconomicoService.findByGastos().subscribe(
      (res: SgiRestListResult<ICodigoEconomico>) => {
        this.codigosEconomicosFiltered = res.items;
        this.formGroup.controls.codigoEconomicoRef.setValidators(SelectValidator.isSelectOption(
          this.codigosEconomicosFiltered.map(cod => cod.codigoEconomicoRef), true));
        this.codigosEconomicos$ = this.formGroup.controls.codigoEconomicoRef.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroCodigoEconomico(value))
          );
        this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'loadCodigosEconomicos()', 'end');
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_INIT);
        this.logger.error(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'loadCodigosEconomicos()', 'error');
      }
    );
    this.suscripciones.push(subscription);
  }

  filtroCodigoEconomico(value: string): ICodigoEconomico[] {
    const filterValue = value.toString().toLowerCase();
    return this.codigosEconomicosFiltered.filter(codigo =>
      codigo.codigoEconomicoRef.toLowerCase().includes(filterValue));
  }

  getCodigoEconomico(codigoEconomico?: ICodigoEconomico): string {
    if (this.formGroup.controls.fechaInicio.value === null && this.formGroup.controls.fechaInicio.value === null) {
      this.formGroup.controls.fechaInicio.setValue(codigoEconomico.fechaInicio);
      this.formGroup.controls.fechaFin.setValue(codigoEconomico.fechaFin);
    }
    return codigoEconomico && typeof codigoEconomico === 'string' ?
      codigoEconomico : codigoEconomico?.codigoEconomicoRef;
  }

  closeModal(convocatoriaConceptoGasto?: IConvocatoriaConceptoGastoCodigoEc): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(convocatoriaConceptoGasto);
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'closeModal()', 'end');
  }

  private isRepetidoConceptoGastoYCodigo(convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc): boolean {
    if (convocatoriaConceptoGastoCodigoEc.id === null) {
      return this.data.convocatoriaConceptoGastoCodigoEcsTabla.some(ccgcec =>
        (ccgcec.convocatoriaConceptoGasto.id === convocatoriaConceptoGastoCodigoEc.convocatoriaConceptoGasto.id &&
          ccgcec.codigoEconomicoRef === convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef) && ccgcec.id !== null)
        || this.data.convocatoriaConceptoGastoCodigoEcsTabla.some(ccgcec =>
          (ccgcec.convocatoriaConceptoGasto.id === convocatoriaConceptoGastoCodigoEc.convocatoriaConceptoGasto.id
            && ccgcec.codigoEconomicoRef === convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef) && ccgcec.id === null);
    } else {
      return this.data.convocatoriaConceptoGastoCodigoEcsTabla.some(ccgcec =>
        (ccgcec.convocatoriaConceptoGasto.id === convocatoriaConceptoGastoCodigoEc.convocatoriaConceptoGasto.id
          && ccgcec.codigoEconomicoRef === convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef));
    }
  }

  /**
   * Se comprueba que no exista el mismo concepto de gasto con el mismo código económico.
   * En el caso de que exista, se comprueba que no se encuentre en el mismo rango de fechas
   *
   * @param convocatoriaConceptoGastoCodigoEc la entidad a evaluar IConvocatoriaConceptoGastoCodigoEc
   * @return true or false
   */
  private isRepetido(convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc): boolean {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'isRepetido(convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc)', 'start');
    let repetido = false;

    if (this.isEquals(convocatoriaConceptoGastoCodigoEc)) {
      repetido = true;
    }

    if (!repetido) {
      const registrosEvaluar = this.data.convocatoriaConceptoGastoCodigoEcsTabla.filter(ccgcec => ccgcec.fechaInicio !== null &&
        ((new Date(ccgcec.fechaInicio).getTime() !== new Date(convocatoriaConceptoGastoCodigoEc.fechaInicio).getTime() ||
          new Date(ccgcec.fechaFin).getTime() !== new Date(convocatoriaConceptoGastoCodigoEc.fechaFin).getTime()) &&
          ccgcec.codigoEconomicoRef === convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef &&
          ccgcec.convocatoriaConceptoGasto.conceptoGasto.id ===
          convocatoriaConceptoGastoCodigoEc.convocatoriaConceptoGasto.conceptoGasto.id));

      if (this.isRepetidoConceptoGastoYCodigo(convocatoriaConceptoGastoCodigoEc) &&
        convocatoriaConceptoGastoCodigoEc.fechaInicio !== null) {

        const fechaInicioCheck = new Date(convocatoriaConceptoGastoCodigoEc.fechaInicio);
        const fechaFinCheck = (convocatoriaConceptoGastoCodigoEc.fechaFin !== null ?
          new Date(convocatoriaConceptoGastoCodigoEc.fechaFin) : new Date('3000-12-30T00:00:00'));
        registrosEvaluar.filter(ccgcec => ccgcec.fechaInicio != null).forEach(ccgcec => {
          if (!repetido) {
            const fechaInicioTabla = new Date(ccgcec.fechaInicio);
            const fechaFinTabla = (ccgcec.fechaFin !== null ? new Date(ccgcec.fechaFin) : new Date('3000-12-30T00:00:00'));
            repetido = DateUtils.dateRangeOverlaps(fechaInicioCheck, fechaFinCheck, fechaInicioTabla, fechaFinTabla);
          }
        });

      }
    }
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'isRepetido(convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc)', 'end');
    return repetido;
  }

  /**
   * Identifica si hay más códigos económicos con idénticos datos al código económico a evaluar
   * @param convocatoriaConceptoGastoCodigoEc el código económico a evaluar
   */
  private isEquals(convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc): boolean {
    if (this.data.convocatoriaConceptoGastoCodigoEcsTabla.some(ccgcec =>
      ccgcec.convocatoriaConceptoGasto.conceptoGasto.id === convocatoriaConceptoGastoCodigoEc.convocatoriaConceptoGasto.conceptoGasto.id
      && new Date(ccgcec.fechaInicio).getTime() === new Date(convocatoriaConceptoGastoCodigoEc.fechaInicio).getTime() &&
      new Date(ccgcec.fechaFin).getTime() ===
      new Date(convocatoriaConceptoGastoCodigoEc.fechaFin).getTime() &&
      ccgcec.codigoEconomicoRef === convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef)) {
      return true;
    }
    return false;
  }

  private loadDatosForm(): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'loadDatosForm()', 'start');
    const convocatoriaConceptoGastoCodigoEc = this.getDatosForm();
    this.data.convocatoriaConceptoGastoCodigoEc.convocatoriaConceptoGasto = convocatoriaConceptoGastoCodigoEc.convocatoriaConceptoGasto;
    this.data.convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef = convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef;
    this.data.convocatoriaConceptoGastoCodigoEc.observaciones = convocatoriaConceptoGastoCodigoEc.observaciones;
    this.data.convocatoriaConceptoGastoCodigoEc.fechaInicio = convocatoriaConceptoGastoCodigoEc.fechaInicio;
    this.data.convocatoriaConceptoGastoCodigoEc.fechaFin = convocatoriaConceptoGastoCodigoEc.fechaFin;
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'loadDatosForm()', 'end');
  }

  private getDatosForm(): IConvocatoriaConceptoGastoCodigoEc {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'getDatosForm()', 'start');
    const convocatoriaConceptoGastoCodigoEc = {
      id: this.data.convocatoriaConceptoGastoCodigoEc.id,
      convocatoriaConceptoGasto: this.formGroup.controls.convocatoriaConceptoGasto.value,
      codigoEconomicoRef: this.formGroup.controls.codigoEconomicoRef.value,
      fechaInicio: this.formGroup.controls.fechaInicio.value,
      fechaFin: this.formGroup.controls.fechaFin.value,
      observaciones: this.formGroup.controls.observaciones.value
    } as IConvocatoriaConceptoGastoCodigoEc;
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'getDatosForm()', 'end');
    return convocatoriaConceptoGastoCodigoEc;
  }

  saveOrUpdate(): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'saveOrUpdate()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      if (this.isRepetido(this.getDatosForm())) {
        this.snackBarService.showError(MSG_ERROR_CONCEPTO_GASTO_REPETIDO);
        this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'closeModal() - end');
        return;
      }
      this.loadDatosForm();
      this.closeModal(this.data.convocatoriaConceptoGastoCodigoEc);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'saveOrUpdate()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones?.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, 'ngOnDestroy()', 'end');
  }

}
