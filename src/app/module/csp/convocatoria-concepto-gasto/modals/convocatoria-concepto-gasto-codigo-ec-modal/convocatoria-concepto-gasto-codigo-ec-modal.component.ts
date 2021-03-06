import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { SelectValue } from '@core/component/select-common/select-common.component';
import { MSG_PARAMS } from '@core/i18n';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { ICodigoEconomico } from '@core/models/sge/codigo-economico';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { CodigoEconomicoService } from '@core/services/sge/codigo-economico.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateValidator } from '@core/validators/date-validator';
import { SelectValidator } from '@core/validators/select-validator';
import { TranslateService } from '@ngx-translate/core';
import { SgiRestListResult } from '@sgi/framework/http/types';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

const MSG_ERROR_INIT = marker('error.load');
const MSG_ANADIR = marker('btn.add');
const MSG_ACEPTAR = marker('btn.ok');
const CONVOCATORIA_CONCEPTO_GASTO_CODIGO_ECONOMICO_KEY = marker('csp.convocatoria-elegibilidad.codigo-economico');
const CONVOCATORIA_CONCEPTO_GASTO_CODIGO_ECONOMICO_SGE_KEY = marker('csp.convocatoria-elegibilidad.codigo-economico.sge');
const CONVOCATORIA_ELEGIBILIDAD_CODIGO_ECONOMICO_PERMITIDO_KEY = marker('csp.convocatoria-elegibilidad.codigo-economico.permitido');
const CONVOCATORIA_ELEGIBILIDAD_CODIGO_ECONOMICO_NO_PERMITIDO_KEY = marker('csp.convocatoria-elegibilidad.codigo-economico.no-permitido');
const TITLE_NEW_ENTITY = marker('title.new.entity');

export interface IConvocatoriaConceptoGastoCodigoEcModalComponent {
  convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc;
  convocatoriaConceptoGastoCodigoEcsTabla: IConvocatoriaConceptoGastoCodigoEc[];
  permitido: boolean;
  editModal: boolean;
  readonly: boolean;
}

@Component({
  templateUrl: './convocatoria-concepto-gasto-codigo-ec-modal.component.html',
  styleUrls: ['./convocatoria-concepto-gasto-codigo-ec-modal.component.scss']
})
export class ConvocatoriaConceptoGastoCodigoEcModalComponent extends
  BaseModalComponent<IConvocatoriaConceptoGastoCodigoEcModalComponent, ConvocatoriaConceptoGastoCodigoEcModalComponent> implements
  OnInit, OnDestroy {
  fxLayoutProperties: FxLayoutProperties;

  convocatoriaConceptoGastosFiltered: IConvocatoriaConceptoGasto[];
  convocatoriaConceptoGastos$: Observable<IConvocatoriaConceptoGasto[]>;

  codigosEconomicos$: Observable<ICodigoEconomico[]>;
  textSaveOrUpdate: string;

  msgParamEntity = {};
  msgParamCodigoEconomigoSgeEntity = {};
  title: string;

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ConvocatoriaConceptoGastoCodigoEcModalComponent>,
    codigoEconomicoService: CodigoEconomicoService,
    @Inject(MAT_DIALOG_DATA) public data: IConvocatoriaConceptoGastoCodigoEcModalComponent,
    private readonly translate: TranslateService
  ) {
    super(snackBarService, matDialogRef, data);
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.xs = 'column';

    this.codigosEconomicos$ = codigoEconomicoService.findByGastos().pipe(
      map(response => response.items)
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
    this.textSaveOrUpdate = this.data.convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef ? MSG_ACEPTAR : MSG_ANADIR;

    this.subscriptions.push(this.codigosEconomicos$.subscribe(
      (codigosEconomicos) => this.formGroup.controls.codigoEconomicoRef.setValidators(
        SelectValidator.isSelectOption(codigosEconomicos.map(cod => cod.codigoEconomicoRef), true)
      )
    ));

    this.subscriptions.push(this.formGroup.controls.codigoEconomicoRef.valueChanges.subscribe(
      (value) => {
        if (!this.formGroup.controls.codigoEconomicoRef.disabled
          && !!!this.formGroup.controls.fechaInicio.value
          && !!!this.formGroup.controls.fechaInicio.value
        ) {
          this.formGroup.controls.fechaInicio.setValue(value.fechaInicio);
          this.formGroup.controls.fechaFin.setValue(value.fechaFin);
        }
      }
    ));
  }

  private setupI18N(): void {
    this.translate.get(
      CONVOCATORIA_CONCEPTO_GASTO_CODIGO_ECONOMICO_SGE_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamCodigoEconomigoSgeEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      CONVOCATORIA_CONCEPTO_GASTO_CODIGO_ECONOMICO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    if (this.data.convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef && this.data.permitido) {
      this.translate.get(
        CONVOCATORIA_ELEGIBILIDAD_CODIGO_ECONOMICO_PERMITIDO_KEY,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).subscribe((value) => this.title = value);
    } else if (this.data.convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef && !this.data.permitido) {
      this.translate.get(
        CONVOCATORIA_ELEGIBILIDAD_CODIGO_ECONOMICO_NO_PERMITIDO_KEY,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).subscribe((value) => this.title = value);
    } else if (!this.data.convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef && this.data.permitido) {
      this.translate.get(
        CONVOCATORIA_ELEGIBILIDAD_CODIGO_ECONOMICO_PERMITIDO_KEY,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).pipe(
        switchMap((value) => {
          return this.translate.get(
            TITLE_NEW_ENTITY,
            { entity: value, ...MSG_PARAMS.GENDER.MALE }
          );
        })
      ).subscribe((value) => this.title = value);
    } else {
      this.translate.get(
        CONVOCATORIA_ELEGIBILIDAD_CODIGO_ECONOMICO_NO_PERMITIDO_KEY,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).pipe(
        switchMap((value) => {
          return this.translate.get(
            TITLE_NEW_ENTITY,
            { entity: value, ...MSG_PARAMS.GENDER.MALE }
          );
        })
      ).subscribe((value) => this.title = value);
    }
  }

  comparerCodigoEconomico(o1: ICodigoEconomico, o2: ICodigoEconomico): boolean {
    if (o1 && o2) {
      return o1?.codigoEconomicoRef === o2?.codigoEconomicoRef;
    }
    return o1 === o2;
  }

  displayerCodigoEconomico(codigoEconomico: ICodigoEconomico) {
    return codigoEconomico?.codigoEconomicoRef ?? '';
  }

  sorterCodigoEconomico(o1: SelectValue<ICodigoEconomico>, o2: SelectValue<ICodigoEconomico>): number {
    return o1?.displayText.localeCompare(o2?.displayText);
  }

  protected getDatosForm(): IConvocatoriaConceptoGastoCodigoEcModalComponent {
    this.data.convocatoriaConceptoGastoCodigoEc.codigoEconomicoRef = this.formGroup.controls.codigoEconomicoRef.value?.codigoEconomicoRef;
    this.data.convocatoriaConceptoGastoCodigoEc.observaciones = this.formGroup.controls.observaciones.value;
    this.data.convocatoriaConceptoGastoCodigoEc.fechaInicio = this.formGroup.controls.fechaInicio.value;
    this.data.convocatoriaConceptoGastoCodigoEc.fechaFin = this.formGroup.controls.fechaFin.value;
    return this.data;
  }

  protected getFormGroup(): FormGroup {
    const codigoEconomico = this.data.convocatoriaConceptoGastoCodigoEc?.codigoEconomicoRef
      ? { codigoEconomicoRef: this.data.convocatoriaConceptoGastoCodigoEc?.codigoEconomicoRef } as ICodigoEconomico
      : null;
    const formGroup = new FormGroup(
      {
        codigoEconomicoRef: new FormControl(codigoEconomico),
        fechaInicio: new FormControl(this.data.convocatoriaConceptoGastoCodigoEc?.fechaInicio),
        fechaFin: new FormControl(this.data.convocatoriaConceptoGastoCodigoEc?.fechaFin),
        observaciones: new FormControl(this.data.convocatoriaConceptoGastoCodigoEc?.observaciones),
      },
      {
        validators: [
          DateValidator.isBefore('fechaFin', 'fechaInicio'),
          DateValidator.isAfter('fechaInicio', 'fechaFin'),
          this.notOverlapsSameCodigoEconomico('fechaInicio', 'fechaFin', 'codigoEconomicoRef')
        ]
      }
    );
    if (this.data.readonly) {
      formGroup.disable();
    }
    if (this.data.editModal) {
      formGroup.controls.codigoEconomicoRef.disable();
      formGroup.controls.observaciones.disable();
    }

    return formGroup;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Comprueba que el rango de fechas entre los 2 campos indicados no se superpone con ninguno de los rangos de la lista
   * filtrada por códigos económicos
   *
   * @param startRangeFieldName Nombre del campo que indica el inicio del rango.
   * @param endRangeFieldName Nombre del campo que indica el fin del rango.
   * @param filterFieldName Filtro para obtener la lista de rangos con los que se quiere comprobar.
   */
  private notOverlapsSameCodigoEconomico(startRangeFieldName: string, endRangeFieldName: string, filterFieldName: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const filterFieldControl = formGroup.controls[filterFieldName];
      const inicioRangoControl = formGroup.controls[startRangeFieldName];
      const finRangoControl = formGroup.controls[endRangeFieldName];

      if (filterFieldControl.value) {
        if ((inicioRangoControl.errors && !inicioRangoControl.errors.overlapped)
          || (finRangoControl.errors && !finRangoControl.errors.overlapped)) {
          return;
        }

        const inicioRangoNumber = inicioRangoControl.value ? inicioRangoControl.value.toMillis() : Number.MIN_VALUE;
        const finRangoNumber = finRangoControl.value ? finRangoControl.value.toMillis() : Number.MAX_VALUE;

        const ranges = this.data.convocatoriaConceptoGastoCodigoEcsTabla.filter(
          conceptoGasto => conceptoGasto.codigoEconomicoRef === filterFieldControl.value
        ).map(conceptoGasto => {
          return {
            inicio: conceptoGasto.fechaInicio ? conceptoGasto.fechaInicio.toMillis() : Number.MIN_VALUE,
            fin: conceptoGasto.fechaFin ? conceptoGasto.fechaFin.toMillis() : Number.MAX_VALUE
          };
        });

        if (ranges.some(r => inicioRangoNumber <= r.fin && r.inicio <= finRangoNumber)) {
          inicioRangoControl.setErrors({ overlapped: true });
          inicioRangoControl.markAsTouched({ onlySelf: true });

          finRangoControl.setErrors({ overlapped: true });
          finRangoControl.markAsTouched({ onlySelf: true });
        } else {
          if (inicioRangoControl.errors) {
            delete inicioRangoControl.errors.overlapped;
            inicioRangoControl.updateValueAndValidity({ onlySelf: true });
          }

          if (finRangoControl.errors) {
            delete finRangoControl.errors.overlapped;
            finRangoControl.updateValueAndValidity({ onlySelf: true });
          }
        }
      }
    };
  }
}
