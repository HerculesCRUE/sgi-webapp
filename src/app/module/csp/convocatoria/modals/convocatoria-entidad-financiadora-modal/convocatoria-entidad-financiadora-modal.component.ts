import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoFinalidad, ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { TipoFinanciacionService } from '@core/services/csp/tipo-financiacion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { BuscarEmpresaEconomicaComponent } from '@shared/buscar-empresa-economica/buscar-empresa-economica.component';
import {
  BuscarEmpresaEconomicaDialogoComponent, EmpresaEconomicaModalData
} from '@shared/buscar-empresa-economica/dialogo/buscar-empresa-economica-dialogo.component';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ConvocatoriaEntidadFinanciadoraDataModal {
  entidad: IConvocatoriaEntidadFinanciadora;
  empresa: IEmpresaEconomica;
  selectedEmpresas: IEmpresaEconomica[];
}

@Component({
  templateUrl: './convocatoria-entidad-financiadora-modal.component.html',
  styleUrls: ['./convocatoria-entidad-financiadora-modal.component.scss']
})
export class ConvocatoriaEntidadFinanciadoraModalComponent extends
  BaseModalComponent<IConvocatoriaEntidadFinanciadora, ConvocatoriaEntidadFinanciadoraModalComponent> implements OnInit {

  fuentesFinanciacion$: Observable<IFuenteFinanciacion[]>;
  tiposFinanciacion$: Observable<ITipoFinalidad[]>;
  private empresa: IEmpresaEconomica;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaEntidadFinanciadoraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConvocatoriaEntidadFinanciadoraDataModal,
    private tipoFinanciacionService: TipoFinanciacionService,
    private fuenteFinanciacionService: FuenteFinanciacionService,
    public dialog: MatDialog
  ) {
    super(logger, snackBarService, matDialogRef, data.entidad);
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.loadFuentesFinanciacion();
    this.loadTiposFinanciacion();
    this.empresa = this.data.empresa;
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, 'ngOnInit()', 'end');
  }

  protected getDatosForm(): IConvocatoriaEntidadFinanciadora {
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.getDatosForm.name}()`, 'start');
    const entidad = this.data.entidad;
    entidad.entidadRef = this.empresa.personaRef;
    entidad.fuenteFinanciacion = this.formGroup.get('fuenteFinanciacion').value;
    entidad.tipoFinanciacion = this.formGroup.get('tipoFinanciacion').value;
    entidad.porcentajeFinanciacion = this.formGroup.get('porcentajeFinanciacion').value;
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.getDatosForm.name}()`, 'end');
    return entidad;
  }

  protected getFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.getFormGroup.name}()`, 'start');
    const formGroup = new FormGroup({
      nombreEmpresa: new FormControl(this.data.empresa.razonSocial),
      fuenteFinanciacion: new FormControl(this.data.entidad.fuenteFinanciacion),
      tipoFinanciacion: new FormControl(this.data.entidad.tipoFinanciacion),
      porcentajeFinanciacion: new FormControl(this.data.entidad.porcentajeFinanciacion)
    });
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.getFormGroup.name}()`, 'end');
    return formGroup;
  }

  /**
   * Carga todas las fuentes de financiación
   */
  private loadFuentesFinanciacion(): void {
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.loadFuentesFinanciacion.name}()`, 'start');
    this.fuentesFinanciacion$ = this.fuenteFinanciacionService.findAll().pipe(
      map((fuenteFinanciones) => fuenteFinanciones.items)
    );
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.loadFuentesFinanciacion.name}()`, 'end');
  }

  /**
   * Carga todos los tipos de financiación
   */
  private loadTiposFinanciacion(): void {
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.loadTiposFinanciacion.name}()`, 'start');
    this.tiposFinanciacion$ = this.tipoFinanciacionService.findAll().pipe(
      map((tipoFinanciaciones) => tipoFinanciaciones.items)
    );
    this.logger.debug(ConvocatoriaEntidadFinanciadoraModalComponent.name, `${this.loadTiposFinanciacion.name}()`, 'end');
  }

  getNombreFuenteFinanciacion(fuenteFinanciacion: IFuenteFinanciacion): string {
    return fuenteFinanciacion?.nombre;
  }

  getNombreTipoFinanciacion(tipoFinanciacion: ITipoFinanciacion): string {
    return tipoFinanciacion?.nombre;
  }

  selectEmpresaEconomica(): void {
    this.logger.debug(BuscarEmpresaEconomicaComponent.name, `${this.selectEmpresaEconomica.name}()`, 'start');
    const data: EmpresaEconomicaModalData = {
      empresaEconomica: this.empresa ? this.empresa : {} as IEmpresaEconomica,
      selectedEmpresa: this.data.selectedEmpresas
    };
    const dialogRef = this.dialog.open(BuscarEmpresaEconomicaDialogoComponent, {
      width: '1000px',
      data
    });
    dialogRef.afterClosed().subscribe(empresaEconomica => {
      if (empresaEconomica) {
        this.empresa = empresaEconomica;
        this.formGroup.get('nombreEmpresa').setValue(empresaEconomica.razonSocial);
      }
    });
    this.logger.debug(BuscarEmpresaEconomicaComponent.name, `${this.selectEmpresaEconomica.name}()`, 'end');
  }
}
