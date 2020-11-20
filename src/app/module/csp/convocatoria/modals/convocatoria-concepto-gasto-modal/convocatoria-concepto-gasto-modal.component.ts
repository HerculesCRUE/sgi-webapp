import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConceptoGastoService } from '@core/services/csp/concepto-gasto.service';
import { IConceptoGasto } from '@core/models/csp/concepto-gasto';
import { NumberValidator } from '@core/validators/number-validator';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ERROR_INIT = marker('csp.convocatoria.concepto-gasto.error.cargar');
const MSG_ERROR_CONCEPTO_GASTO_REPETIDO = marker('csp.convocatoria.concepto-gasto.modal.repetido');

export interface IConvocatoriaConceptoGastoModalComponent {
  convocatoriaConceptoGasto: IConvocatoriaConceptoGasto;
  convocatoriaConceptoGastosTabla: IConvocatoriaConceptoGasto[];
  editModal: boolean;
}

@Component({
  templateUrl: './convocatoria-concepto-gasto-modal.component.html',
  styleUrls: ['./convocatoria-concepto-gasto-modal.component.scss']
})
export class ConvocatoriaConceptoGastoModalComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  suscripciones: Subscription[];

  conceptoGastosFiltered: IConceptoGasto[];
  conceptoGastos$: Observable<IConceptoGasto[]>;

  constructor(
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaConceptoGastoModalComponent>,
    private readonly conceptoGastoService: ConceptoGastoService,
    @Inject(MAT_DIALOG_DATA) public data: IConvocatoriaConceptoGastoModalComponent
  ) {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'ngOnInit()', 'start');
    this.suscripciones = [];
    this.initFormGroup();
    this.loadConceptoGastos();
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'ngOnInit()', 'end');
  }

  initFormGroup() {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'initFormGroup()', 'start');
    this.formGroup = new FormGroup({
      conceptoGasto: new FormControl(this.data.convocatoriaConceptoGasto?.conceptoGasto, [IsEntityValidator.isValid()]),
      importeMaximo: new FormControl(this.data.convocatoriaConceptoGasto?.importeMaximo, [Validators.compose(
        [Validators.min(0), NumberValidator.maxDecimalPlaces(5)])]),
      numMeses: new FormControl(this.data.convocatoriaConceptoGasto?.numMeses, [Validators.compose(
        [Validators.min(0), Validators.max(9999), NumberValidator.isInteger()])]),
      observaciones: new FormControl(this.data.convocatoriaConceptoGasto?.observaciones),
    });
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'initFormGroup()', 'start');
  }

  loadConceptoGastos() {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'loadTiposEnlaces()', 'start');
    this.suscripciones.push(
      this.conceptoGastoService.findAll().subscribe(
        (res: SgiRestListResult<IConceptoGasto>) => {
          this.conceptoGastosFiltered = res.items;
          this.conceptoGastos$ = this.formGroup.controls.conceptoGasto.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroConceptoGasto(value))
            );
          this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'loadTiposEnlaces()', 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.error(ConvocatoriaConceptoGastoModalComponent.name, 'loadTiposEnlaces()', 'error');
        }
      )
    );
  }

  filtroConceptoGasto(value: string): IConceptoGasto[] {
    const filterValue = value.toString().toLowerCase();
    return this.conceptoGastosFiltered.filter(tipoLazoEnlace => tipoLazoEnlace.nombre.toLowerCase().includes(filterValue));
  }

  getNombreConceptoGasto(conceptoGasto?: IConceptoGasto): string | undefined {
    return typeof conceptoGasto === 'string' ? conceptoGasto : conceptoGasto?.nombre;
  }

  closeModal(convocatoriaConceptoGasto?: IConvocatoriaConceptoGasto): void {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(convocatoriaConceptoGasto);
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'closeModal()', 'end');
  }

  isRepetido(convocatoriaConceptoGasto: IConvocatoriaConceptoGasto): boolean {
    if (convocatoriaConceptoGasto.id === null) {
      return this.data.convocatoriaConceptoGastosTabla.some(ccg =>
        ccg.conceptoGasto.id === convocatoriaConceptoGasto.conceptoGasto.id && ccg.id !== null)
        || (this.data.editModal ? this.data.convocatoriaConceptoGastosTabla.filter(ccg =>
          ccg.conceptoGasto.id === convocatoriaConceptoGasto.conceptoGasto.id && ccg.id === null
        ).length > 1 : this.data.convocatoriaConceptoGastosTabla.some(ccg =>
          ccg.conceptoGasto.id === convocatoriaConceptoGasto.conceptoGasto.id && ccg.id === null));
    } else {
      return this.data.convocatoriaConceptoGastosTabla.some(ccg =>
        (ccg.conceptoGasto.id === convocatoriaConceptoGasto.conceptoGasto.id && convocatoriaConceptoGasto.id !== ccg.id));
    }
  }

  private loadDatosForm(): void {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'getDatosForm()', 'start');
    const convocatoriaConceptoGasto = this.getDatosForm();
    this.data.convocatoriaConceptoGasto.conceptoGasto = convocatoriaConceptoGasto.conceptoGasto;
    this.data.convocatoriaConceptoGasto.importeMaximo = convocatoriaConceptoGasto.importeMaximo;
    this.data.convocatoriaConceptoGasto.numMeses = convocatoriaConceptoGasto.numMeses;
    this.data.convocatoriaConceptoGasto.observaciones = convocatoriaConceptoGasto.observaciones;
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'getDatosForm()', 'end');
  }

  private getDatosForm(): IConvocatoriaConceptoGasto {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'getDatosForm()', 'start');
    return {
      id: this.data.convocatoriaConceptoGasto.id,
      conceptoGasto: this.formGroup.controls.conceptoGasto.value,
      importeMaximo: this.formGroup.controls.importeMaximo.value,
      numMeses: this.formGroup.controls.numMeses.value,
      observaciones: this.formGroup.controls.observaciones.value
    } as IConvocatoriaConceptoGasto;
  }

  saveOrUpdate(): void {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'updateComentario()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      if (this.isRepetido(this.getDatosForm())) {
        this.snackBarService.showError(MSG_ERROR_CONCEPTO_GASTO_REPETIDO);
        this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'closeModal() - end');
        return;
      }
      this.loadDatosForm();
      this.closeModal(this.data.convocatoriaConceptoGasto);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'updateComentario()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones?.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaConceptoGastoModalComponent.name, 'ngOnDestroy()', 'end');
  }

}
