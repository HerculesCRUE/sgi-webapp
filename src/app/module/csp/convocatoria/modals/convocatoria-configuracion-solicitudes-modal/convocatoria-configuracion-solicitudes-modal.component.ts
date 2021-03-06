import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { MSG_PARAMS } from '@core/i18n';
import { IDocumentoRequeridoSolicitud } from '@core/models/csp/documento-requerido-solicitud';
import { ITipoDocumento } from '@core/models/csp/tipos-configuracion';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

const MSG_ANADIR = marker('btn.add');
const MSG_ACEPTAR = marker('btn.ok');
const CONVOCATORIA_CONFIGURACION_SOLICITUD_TIPO_DOCUMENTO_KEY = marker('csp.documento.tipo');
const CONVOCATORIA_CONFIGURACION_SOLICITUD_DOCUMENTO_REQUERIDO_KEY = marker('csp.convocatoria-configuracion-solicitud-documento-requerido');
const TITLE_NEW_ENTITY = marker('title.new.entity');

export interface ConvocatoriaConfiguracionSolicitudesModalData {
  documentoRequerido: IDocumentoRequeridoSolicitud;
  tipoFaseId: number;
  modeloEjecucionId: number;
  readonly: boolean;
}

@Component({
  templateUrl: './convocatoria-configuracion-solicitudes-modal.component.html',
  styleUrls: ['./convocatoria-configuracion-solicitudes-modal.component.scss']
})
export class ConvocatoriaConfiguracionSolicitudesModalComponent
  extends BaseModalComponent<ConvocatoriaConfiguracionSolicitudesModalData, ConvocatoriaConfiguracionSolicitudesModalComponent>
  implements OnInit {
  fxLayoutProperties: FxLayoutProperties;

  documentosRequeridos$: Observable<ITipoDocumento[]>;
  textSaveOrUpdate: string;
  title: string;

  msgParamTipoDocumentoEntity = {};

  constructor(
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ConvocatoriaConfiguracionSolicitudesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConvocatoriaConfiguracionSolicitudesModalData,
    modeloEjecucionService: ModeloEjecucionService,
    private readonly translate: TranslateService
  ) {
    super(snackBarService, matDialogRef, data);
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';

    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter(
        'modeloTipoFase.tipoFase.id',
        SgiRestFilterOperator.EQUALS,
        this.data.tipoFaseId ? this.data.tipoFaseId.toString() : null
      )
    };
    this.documentosRequeridos$ = modeloEjecucionService.findModeloTipoDocumento(this.data.modeloEjecucionId, options).pipe(
      map(response => response.items.map(modeloDocumento => modeloDocumento.tipoDocumento))
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
    this.textSaveOrUpdate = this.data.documentoRequerido.tipoDocumento ? MSG_ACEPTAR : MSG_ANADIR;
  }

  private setupI18N(): void {
    this.translate.get(
      CONVOCATORIA_CONFIGURACION_SOLICITUD_TIPO_DOCUMENTO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamTipoDocumentoEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    if (this.data?.documentoRequerido?.tipoDocumento) {
      this.translate.get(
        CONVOCATORIA_CONFIGURACION_SOLICITUD_DOCUMENTO_REQUERIDO_KEY,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).subscribe((value) => this.title = value);
    } else {
      this.translate.get(
        CONVOCATORIA_CONFIGURACION_SOLICITUD_DOCUMENTO_REQUERIDO_KEY,
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

  protected getDatosForm(): ConvocatoriaConfiguracionSolicitudesModalData {
    this.data.documentoRequerido.tipoDocumento = this.formGroup.controls.tipoDocumento.value;
    this.data.documentoRequerido.observaciones = this.formGroup.controls.observaciones.value;
    return this.data;
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      tipoDocumento: new FormControl(this.data.documentoRequerido.tipoDocumento, Validators.required),
      observaciones: new FormControl(this.data.documentoRequerido.observaciones),
    });
    if (this.data.readonly) {
      formGroup.disable();
    }
    return formGroup;
  }
}
