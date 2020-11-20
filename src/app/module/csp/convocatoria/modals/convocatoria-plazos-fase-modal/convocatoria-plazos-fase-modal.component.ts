import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IPlazosFases } from '@core/models/csp/plazos-fases';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { DateValidator } from '@core/validators/date-validator';
import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { RangeValidator } from '@core/validators/range-validator';
import { DateUtils } from '@core/utils/date-utils';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ERROR_INIT = marker('csp.convocatoria.plazos.fases.error.cargar');
const MSG_ERROR_TIPOS = marker('csp.convocatoria.tipo.fases.error.cargar');

export interface ConvocatoriaPlazosFaseModalComponentData {
  plazos: any;
  plazo: IConvocatoriaFase;
  idModeloEjecucion: number;
}
@Component({
  selector: 'sgi-convocatoria-plazos-fase-modal',
  templateUrl: './convocatoria-plazos-fase-modal.component.html',
  styleUrls: ['./convocatoria-plazos-fase-modal.component.scss']
})
export class ConvocatoriaPlazosFaseModalComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  fxFlexProperties: FxFlexProperties;
  fxFlexProperties2: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxLayoutProperties2: FxLayoutProperties;

  FormGroupUtil = FormGroupUtil;
  modeloTipoFases$: Observable<IModeloTipoFase[]>;

  private modeloTipoFasesFiltered: IModeloTipoFase[];

  suscripciones: Subscription[];

  constructor(
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) private data: ConvocatoriaPlazosFaseModalComponentData,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaPlazosFaseModalComponent>,
    private readonly modeloEjecucionService: ModeloEjecucionService,
    private readonly convocatoriaService: ConvocatoriaService
  ) {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'constructor()', 'start');

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.xs = 'column';

    this.fxLayoutProperties2 = new FxLayoutProperties();
    this.fxLayoutProperties2.gap = '20px';
    this.fxLayoutProperties2.layout = 'row';
    this.fxLayoutProperties2.xs = 'column';

    this.fxFlexProperties2 = new FxFlexProperties();
    this.fxFlexProperties2.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties2.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties2.gtMd = '0 1 calc(50%-10px)';
    this.fxFlexProperties2.order = '3';

    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'ngOnInit()', 'start');
    this.suscripciones = [];
    this.initFormGroup();
    this.loadTipoFases();
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'ngOnInit()', 'start');
  }

  /**
   * Inicializa formulario de creación/edición de plazos y fases
   */
  private initFormGroup() {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'initFormGroup()', 'start');

    const rangosFasesExistentes = this.data.plazos
      .filter(fase => fase.value.fechaInicio !== this.data.plazos.fechaInicio)
      .map(fase => {
        return {
          inicio: DateUtils.fechaToDate(fase.value.fechaInicio).getTime(),
          fin: DateUtils.fechaToDate(fase.value.fechaFin).getTime()
        };
      });

    this.formGroup = new FormGroup({
      fechaInicio: new FormControl(this.data?.plazo?.fechaInicio, [Validators.required]),
      fechaFin: new FormControl(this.data?.plazo?.fechaFin, [Validators.required]),
      tipoFase: new FormControl(this.data?.plazo?.tipoFase, [Validators.required]),
      observaciones: new FormControl(this.data?.plazo?.observaciones, [Validators.maxLength(250)])
    },
      {
        validators: [
          DateValidator.isAfter('fechaInicio', 'fechaFin'),
          DateValidator.isBefore('fechaFin', 'fechaInicio'),
          RangeValidator.notOverlaps('fechaInicio', 'fechaFin', rangosFasesExistentes)
        ],
      });
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'initFormGroup()', 'end');
  }

  loadTipoFases() {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'loadTipoFases()', 'start');
    this.suscripciones.push(this.modeloEjecucionService.findModeloTipoFase(this.data.idModeloEjecucion).subscribe(
      (res: SgiRestListResult<IModeloTipoFase>) => {
        this.modeloTipoFasesFiltered = res.items;
        this.modeloTipoFases$ = this.formGroup.controls.tipoFase.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroTipoPlazosFase(value))
          );
        this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'loadTipoFases()', 'end');
      },
      () => {
        if (this.data.idModeloEjecucion) {
          this.snackBarService.showError(MSG_ERROR_INIT);
        } else {
          this.snackBarService.showError(MSG_ERROR_TIPOS);
        }
        this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'loadTipoFases()', 'end');
      })
    );


    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'loadTipoFases()', 'end');
  }

  /**
   * Actualizar o guardar datos
   */
  saveOrUpdate(): void {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'saveOrUpdate()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.data.plazo);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'saveOrUpdate()', 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   *
   * @returns Comentario con los datos del formulario
   */
  private loadDatosForm(): void {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'loadDatosForm()', 'start');
    this.data.plazo.fechaInicio = FormGroupUtil.getValue(this.formGroup, 'fechaInicio');
    this.data.plazo.fechaFin = FormGroupUtil.getValue(this.formGroup, 'fechaFin');
    this.data.plazo.tipoFase = FormGroupUtil.getValue(this.formGroup, 'tipoFase');
    this.data.plazo.observaciones = FormGroupUtil.getValue(this.formGroup, 'observaciones');
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'loadDatosForm()', 'end');
  }

  /**
   * Devuelve el nombre tipo de plazos fase
   * @param tipoFase tipo de plazos fase
   * @returns nombre de plazos fase
   */
  getTipoPlazosFase(tipoFase?: ITipoFase): string | undefined {
    console.log(tipoFase);
    return typeof tipoFase === 'string' ? tipoFase : tipoFase?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio.
   *
   * @param value del input para autocompletar
   */
  filtroTipoPlazosFase(value: string): IModeloTipoFase[] {
    const filterValue = value.toString().toLowerCase();
    return this.modeloTipoFasesFiltered.filter(modeloTipoFase => modeloTipoFase.tipoFase?.nombre?.toLowerCase().includes(filterValue));
  }

  /**
   * Cierra la ventana modal
   *
   */
  closeModal(plazos?: IConvocatoriaFase): void {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(plazos);
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'closeModal()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones?.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaPlazosFaseModalComponent.name, 'ngOnDestroy()', 'end');
  }


}
