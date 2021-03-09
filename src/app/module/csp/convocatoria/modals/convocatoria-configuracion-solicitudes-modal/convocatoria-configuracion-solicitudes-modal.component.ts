import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IDocumentoRequerido } from '@core/models/csp/documentos-requeridos-solicitud';
import { ITipoDocumento } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const MSG_ERROR_INIT = marker('csp.convocatoria.plazos.enlace.error.cargar');
const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

export interface ConvocatoriaConfiguracionSolicitudesModalData {
  documentoRequerido: IDocumentoRequerido;
  modeloEjecucionId: number;
  readonly: boolean;
}

@Component({
  templateUrl: './convocatoria-configuracion-solicitudes-modal.component.html',
  styleUrls: ['./convocatoria-configuracion-solicitudes-modal.component.scss']
})
export class ConvocatoriaConfiguracionSolicitudesModalComponent extends
  BaseModalComponent<ConvocatoriaConfiguracionSolicitudesModalData, ConvocatoriaConfiguracionSolicitudesModalComponent>
  implements OnInit {
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;

  documentoRequeridoFiltered: ITipoDocumento[];
  documentoRequerido$: Observable<ITipoDocumento[]>;
  textSaveOrUpdate: string;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaConfiguracionSolicitudesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConvocatoriaConfiguracionSolicitudesModalData,
    private modeloEjecucionService: ModeloEjecucionService
  ) {
    super(snackBarService, matDialogRef, data);
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
    this.loadTipoDocumento();
    this.textSaveOrUpdate = this.data.documentoRequerido.tipoDocumento ? MSG_ACEPTAR : MSG_ANADIR;
  }

  /**
   * Carga todos los tipos de documento
   */
  loadTipoDocumento() {
    const modeloEjecucionId = this.data.modeloEjecucionId;
    const idTipoFase = this.data.documentoRequerido.configuracionSolicitud.fasePresentacionSolicitudes?.tipoFase.id;
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('modeloTipoFase.tipoFase.id', SgiRestFilterOperator.EQUALS, idTipoFase ? idTipoFase.toString() : null)
    };
    const subscription = this.modeloEjecucionService.findModeloTipoDocumento(modeloEjecucionId, options).pipe(
      map((result => {
        const listado: ITipoDocumento[] = [];
        result.items.forEach(x => listado.push(x.tipoDocumento));
        return listado;
      }))
    ).subscribe(
      (res) => {
        this.documentoRequeridoFiltered = res;
        this.documentoRequerido$ = this.formGroup.controls.tipoDocumento.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroTipoDocumento(value))
          );
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT);
      }
    );
    this.subscriptions.push(subscription);
  }

  /**
   * Filtra la lista devuelta por el servicio.
   *
   * @param value del input para autocompletar
   */
  filtroTipoDocumento(value: string): ITipoDocumento[] {
    const filterValue = value.toString().toLowerCase();
    return this.documentoRequeridoFiltered.filter(docRequerido => docRequerido.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre
   * @param docRequerido array de documentos requeridos
   */
  getNombreTipoDocumento(docRequerido?: ITipoDocumento): string | undefined {
    return typeof docRequerido === 'string' ? docRequerido : docRequerido?.nombre;
  }

  protected getDatosForm(): ConvocatoriaConfiguracionSolicitudesModalData {
    this.data.documentoRequerido.tipoDocumento = this.formGroup.controls.tipoDocumento.value;
    this.data.documentoRequerido.observaciones = this.formGroup.controls.observaciones.value;
    return this.data;
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      tipoDocumento: new FormControl(this.data.documentoRequerido.tipoDocumento),
      observaciones: new FormControl(this.data.documentoRequerido.observaciones),
    });
    if (this.data.readonly) {
      formGroup.disable();
    }
    return formGroup;
  }
}
