import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { ITipoEnlace } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IModeloTipoEnlace } from '@core/models/csp/modelo-tipo-enlace';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ERROR_INIT = marker('csp.convocatoria.enlace.error.cargar');
const MSG_ERROR_TIPOS = marker('csp.convocatoria.tipo.enlace.error.cargar');

export interface ConvocatoriaEnlaceModalComponentData {
  enlace: IConvocatoriaEnlace;
  idModeloEjecucion: number;
}
@Component({
  templateUrl: './convocatoria-enlace-modal.component.html',
  styleUrls: ['./convocatoria-enlace-modal.component.scss']
})
export class ConvocatoriaEnlaceModalComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  suscripciones: Subscription[];

  modeloTiposEnlace$: Observable<IModeloTipoEnlace[]>;
  private modeloTiposEnlaceFiltered: IModeloTipoEnlace[];

  constructor(
    private logger: NGXLogger,
    private snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ConvocatoriaEnlaceModalComponent>,
    private modeloEjecucionService: ModeloEjecucionService,
    @Inject(MAT_DIALOG_DATA) public data: ConvocatoriaEnlaceModalComponentData,
  ) {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'ngOnInit()', 'start');
    this.suscripciones = [];
    this.formGroup = new FormGroup({
      url: new FormControl(this.data?.enlace?.url, [Validators.maxLength(250)]),
      descripcion: new FormControl(this.data?.enlace?.tipoEnlace?.descripcion, [Validators.maxLength(250)]),
      tipoEnlace: new FormControl(this.data?.enlace?.tipoEnlace, [IsEntityValidator.isValid()]),
    });
    this.loadTiposEnlaces();
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Carga todos los tipos de enlace
   */
  loadTiposEnlaces() {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'loadTiposEnlaces()', 'start');
    this.suscripciones.push(this.modeloEjecucionService.findModeloTipoEnlace(this.data.idModeloEjecucion).subscribe(
      (res: SgiRestListResult<IModeloTipoEnlace>) => {
        this.modeloTiposEnlaceFiltered = res.items;
        this.modeloTiposEnlace$ = this.formGroup.controls.tipoEnlace.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroTipoEnlace(value))
          );
        this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'loadTiposEnlaces()', 'end');
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_INIT);
        this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'loadTiposEnlaces()', 'end');
      })
    );
  }

  /**
   * Filtra la lista devuelta por el servicio.
   *
   * @param value del input para autocompletar
   */
  filtroTipoEnlace(value: string): IModeloTipoEnlace[] {
    const filterValue = value.toString().toLowerCase();
    return this.modeloTiposEnlaceFiltered.filter(modeloTipoLazoEnlace =>
      modeloTipoLazoEnlace.tipoEnlace?.nombre.toLowerCase().includes(filterValue));
  }

  getNombreTipoEnlace(tipoEnlace?: ITipoEnlace): string | undefined {
    return typeof tipoEnlace === 'string' ? tipoEnlace : tipoEnlace?.nombre;
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones?.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Cierra la ventana modal y devuelve la entidad financiadora
   *
   * @param enlace Entidad financiadora modificada
   */
  closeModal(enlace?: IConvocatoriaEnlace): void {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(enlace);
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'closeModal()', 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'saveOrUpdate()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.data.enlace);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'saveOrUpdate()', 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   *
   * @returns Comentario con los datos del formulario
   */
  private loadDatosForm(): void {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'loadDatosForm()', 'start');
    this.data.enlace.url = FormGroupUtil.getValue(this.formGroup, 'url');
    this.data.enlace.descripcion = FormGroupUtil.getValue(this.formGroup, 'descripcion');
    this.data.enlace.tipoEnlace = FormGroupUtil.getValue(this.formGroup, 'tipoEnlace');
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name, 'loadDatosForm()', 'end');
  }

}
