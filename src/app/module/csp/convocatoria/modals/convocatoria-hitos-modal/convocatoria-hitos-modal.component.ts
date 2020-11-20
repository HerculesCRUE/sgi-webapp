import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { NGXLogger } from 'ngx-logger';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FormGroupUtil } from '@core/utils/form-group-util';

import { SnackBarService } from '@core/services/snack-bar.service';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { Observable, Subscription } from 'rxjs';
import { SgiRestListResult } from '@sgi/framework/http/types';
import { startWith, map } from 'rxjs/operators';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { ITipoHito } from '@core/models/csp/tipos-configuracion';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { IModeloTipoHito } from '@core/models/csp/modelo-tipo-hito';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';

const MSG_ERROR_INIT = marker('csp.convocatoria.hitos.error.cargar');
const MSG_ERROR_TIPOS = marker('csp.convocatoria.tipo.hitos.error.cargar');
const MSG_ERROR_FORM_GROUP = marker('form-group.error');

export interface ConvocatoriaHitosModalComponentData {
  hito: IConvocatoriaHito;
  idModeloEjecucion: number;
}
@Component({
  templateUrl: './convocatoria-hitos-modal.component.html',
  styleUrls: ['./convocatoria-hitos-modal.component.scss']
})
export class ConvocatoriaHitosModalComponent implements OnInit {

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;

  fxFlexProperties: FxFlexProperties;
  fxFlexProperties2: FxFlexProperties;
  fxFlexProperties3: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  modeloTiposHito$: Observable<IModeloTipoHito[]>;

  private modeloTiposHitoFiltered: IModeloTipoHito[];

  suscripciones: Subscription[] = [];

  constructor(
    private readonly logger: NGXLogger,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaHitosModalComponent>,
    private readonly modeloEjecucionService: ModeloEjecucionService,
    private readonly convocatoriaService: ConvocatoriaService,
    @Inject(MAT_DIALOG_DATA) private data: ConvocatoriaHitosModalComponentData,
    private readonly snackBarService: SnackBarService) {

    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(15%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexProperties2 = new FxFlexProperties();
    this.fxFlexProperties2.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.gtMd = '0 1 calc(40%-10px)';
    this.fxFlexProperties2.order = '3';

    this.fxFlexProperties3 = new FxFlexProperties();
    this.fxFlexProperties3.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {

    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'ngOnInit()', 'start');

    this.formGroup = new FormGroup({
      tipoHito: new FormControl(this.data?.hito?.tipoHito, [Validators.required, IsEntityValidator.isValid()]),
      fechaInicio: new FormControl(this.data?.hito?.fecha, [Validators.required]),
      comentario: new FormControl(this.data?.hito?.comentario, [Validators.maxLength(250)]),
      aviso: new FormControl(this.data?.hito?.generaAviso)
    });
    this.loadTiposHito();
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'ngOnInit()', 'start');
  }

  loadTiposHito() {
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'loadTiposHito()', 'start');

    this.suscripciones.push(
      this.modeloEjecucionService.findModeloTipoHito(this.data.idModeloEjecucion).subscribe(
        (res: SgiRestListResult<IModeloTipoHito>) => {
          this.modeloTiposHitoFiltered = res.items;
          this.modeloTiposHito$ = this.formGroup.controls.tipoHito.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroTipoHito(value))
            );
          this.logger.debug(ConvocatoriaHitosModalComponent.name, 'loadTiposHito()', 'end');
        },
        () => {
          if (this.data.idModeloEjecucion) {
            this.snackBarService.showError(MSG_ERROR_INIT);
          } else {
            this.snackBarService.showError(MSG_ERROR_TIPOS);
          }
          this.logger.debug(ConvocatoriaHitosModalComponent.name, 'loadTiposHito()', 'end');
        })
    );
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'loadTiposHito()', 'end');
  }

  /**
   * Devuelve el nombre de un tipo de hito.
   * @param tipoHito tipo de hito.
   * @returns nombre de un tipo de hito.
   */
  getTipoHito(tipoHito?: ITipoHito): string | undefined {
    return typeof tipoHito === 'string' ? tipoHito : tipoHito?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio.
   *
   * @param value del input para autocompletar
   */
  filtroTipoHito(value: string): IModeloTipoHito[] {
    const filterValue = value.toString().toLowerCase();
    return this.modeloTiposHitoFiltered.filter(modeloTipoHito => modeloTipoHito.tipoHito?.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Cierra la ventana modal y devuelve el hito modificado o creado.
   *
   * @param hito hito modificado o creado.
   */
  closeModal(hito?: IConvocatoriaHito): void {
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(hito);
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'closeModal()', 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'updateComentario()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.data.hito);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'updateComentario()', 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   *
   * @returns Comentario con los datos del formulario
   */
  private loadDatosForm(): void {
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'loadDatosForm()', 'start');
    this.data.hito.comentario = this.formGroup.get('comentario').value;
    this.data.hito.fecha = this.formGroup.get('fechaInicio').value;
    this.data.hito.tipoHito = this.formGroup.get('tipoHito').value;
    this.data.hito.generaAviso = this.formGroup.get('aviso').value ? this.formGroup.get('aviso').value : false;
    this.logger.debug(ConvocatoriaHitosModalComponent.name, 'loadDatosForm()', 'end');
  }


}
