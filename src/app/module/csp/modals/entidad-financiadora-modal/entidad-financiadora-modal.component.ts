import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoFinalidad, ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { TipoFinanciacionService } from '@core/services/csp/tipo-financiacion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface EntidadFinanciadoraDataModal {
  title: string;
  entidad: IEntidadFinanciadora;
  selectedEmpresas: IEmpresaEconomica[];
  readonly: boolean;
}

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
@Component({
  templateUrl: './entidad-financiadora-modal.component.html',
  styleUrls: ['./entidad-financiadora-modal.component.scss']
})
export class EntidadFinanciadoraModalComponent extends
  BaseModalComponent<IEntidadFinanciadora, EntidadFinanciadoraModalComponent> implements OnInit {

  fuentesFinanciacion$: Observable<IFuenteFinanciacion[]>;
  tiposFinanciacion$: Observable<ITipoFinalidad[]>;
  textSaveOrUpdate: string;
  title: string;

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<EntidadFinanciadoraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EntidadFinanciadoraDataModal,
    private tipoFinanciacionService: TipoFinanciacionService,
    private fuenteFinanciacionService: FuenteFinanciacionService
  ) {
    super(snackBarService, matDialogRef, data.entidad);
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadFuentesFinanciacion();
    this.loadTiposFinanciacion();
    this.textSaveOrUpdate = this.data.entidad?.empresa ? MSG_ACEPTAR : MSG_ANADIR;
  }

  protected getDatosForm(): IEntidadFinanciadora {
    const fuenteFinanciacion = this.formGroup.get('fuenteFinanciacion').value;
    const tipoFinanciacion = this.formGroup.get('tipoFinanciacion').value;

    const entidad = this.data.entidad;
    entidad.empresa = this.formGroup.get('empresaEconomica').value;
    entidad.fuenteFinanciacion = typeof fuenteFinanciacion === 'string' ? undefined : fuenteFinanciacion;
    entidad.tipoFinanciacion = typeof tipoFinanciacion === 'string' ? undefined : tipoFinanciacion;
    entidad.porcentajeFinanciacion = this.formGroup.get('porcentajeFinanciacion').value;
    return entidad;
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      empresaEconomica: new FormControl(
        {
          value: this.data.entidad.empresa,
          disabled: this.data.entidad.empresa || this.data.readonly
        },
        [Validators.required]),
      fuenteFinanciacion: new FormControl(this.data.entidad.fuenteFinanciacion),
      tipoFinanciacion: new FormControl(this.data.entidad.tipoFinanciacion),
      porcentajeFinanciacion: new FormControl(this.data.entidad.porcentajeFinanciacion, [
        Validators.min(0),
        Validators.max(100)
      ])
    });
    if (this.data.readonly) {
      formGroup.disable();
    }
    return formGroup;
  }

  /**
   * Carga todas las fuentes de financiación
   */
  private loadFuentesFinanciacion(): void {
    this.fuentesFinanciacion$ = this.fuenteFinanciacionService.findAll().pipe(
      map((fuenteFinanciones) => fuenteFinanciones.items)
    );
  }

  /**
   * Carga todos los tipos de financiación
   */
  private loadTiposFinanciacion(): void {
    this.tiposFinanciacion$ = this.tipoFinanciacionService.findAll().pipe(
      map((tipoFinanciaciones) => tipoFinanciaciones.items)
    );
  }

  getNombreFuenteFinanciacion(fuenteFinanciacion: IFuenteFinanciacion): string {
    return fuenteFinanciacion?.nombre;
  }

  getNombreTipoFinanciacion(tipoFinanciacion: ITipoFinanciacion): string {
    return tipoFinanciacion?.nombre;
  }
}
