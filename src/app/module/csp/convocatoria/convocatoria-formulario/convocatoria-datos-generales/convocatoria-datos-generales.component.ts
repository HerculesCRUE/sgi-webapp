import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { CLASIFICACION_CVN_MAP } from '@core/enums/clasificacion-cvn';
import { MSG_PARAMS } from '@core/i18n';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { ITipoRegimenConcurrencia } from '@core/models/csp/tipo-regimen-concurrencia';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoRegimenConcurrenciaService } from '@core/services/csp/tipo-regimen-concurrencia.service';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaAreaTematicaModalComponent } from '../../modals/convocatoria-area-tematica-modal/convocatoria-area-tematica-modal.component';
import { AreaTematicaData, ConvocatoriaDatosGeneralesFragment } from './convocatoria-datos-generales.fragment';

const MSG_DELETE_AREA_TEMATICA = marker('msg.delete.entity');
const AREA_KEY = marker('csp.area');
const AREA_TEMATICA_KEY = marker('csp.area-tematica');
const CONVOCATORIA_FECHA_PUBLICACION_KEY = marker('csp.convocatoria.fecha-publicacion');
const CONVOCATORIA_FECHA_PROVISIONAL_KEY = marker('csp.convocatoria.fecha-provisional');
const CONVOCATORIA_FECHA_CONCESION_KEY = marker('csp.convocatoria.fecha-concesion');
const CONVOCATORIA_AMBITO_GEOGRAFICO_KEY = marker('csp.convocatoria.ambito-geografico');
const CONVOCATORIA_CODIGO_REFERENCIA_KEY = marker('csp.convocatoria.codigo-referencia');
const CONVOCATORIA_DESCRIPCION_KEY = marker('csp.convocatoria.descripcion');
const CONVOCATORIA_DURACION_KEY = marker('csp.convocatoria.duracion');
const CONVOCATORIA_FINALIDAD_KEY = marker('csp.convocatoria.finalidad');
const CONVOCATORIA_MODELO_EJECUCION_KEY = marker('csp.convocatoria.modelo-ejecucion');
const CONVOCATORIA_OBSERVACIONES_KEY = marker('csp.convocatoria.observaciones');
const CONVOCATORIA_TITULO_KEY = marker('csp.convocatoria.titulo');
const CONVOCATORIA_UNIDAD_GESTION_KEY = marker('csp.convocatoria.unidad-gestion');

@Component({
  selector: 'sgi-convocatoria-datos-generales',
  templateUrl: './convocatoria-datos-generales.component.html',
  styleUrls: ['./convocatoria-datos-generales.component.scss']
})
export class ConvocatoriaDatosGeneralesComponent extends FormFragmentComponent<IConvocatoria> implements OnInit {
  formPart: ConvocatoriaDatosGeneralesFragment;

  regimenesConcurrencia$: Observable<ITipoRegimenConcurrencia[]>;

  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesOne: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxFlexPropertiesEntidad: FxFlexProperties;

  private subscriptions = [] as Subscription[];

  msgParamAmbitoGeograficoEntity = {};
  msgParamAreaEntities = {};
  msgParamAreaTematicaEntity = {};
  msgParamAreaTematicaEntities = {};
  msgParamCodigoReferenciaEntity = {};
  msgParamDescripcionEntity = {};
  msgParamDuracionEntity = {};
  msgParamFinalidadEntity = {};
  msgParamModeloEjecucionEntity = {};
  msgParamObservacionesEntity = {};
  msgParamFechaConcesionEntity = {};
  msgParamFechaProvisionalEntity = {};
  msgParamFechaPublicacionEntity = {};
  msgParamTituloEntity = {};
  msgParamUnidadGestionEntity = {};
  textoDeleteAreaTematica: string;

  convocatoriaAreaTematicas = new MatTableDataSource<AreaTematicaData>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  columns = ['padre', 'nombre', 'observaciones', 'acciones'];

  get CLASIFICACION_CVN_MAP() {
    return CLASIFICACION_CVN_MAP;
  }

  constructor(
    protected actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService,
    private readonly translate: TranslateService,
    tipoRegimenConcurrenciaService: TipoRegimenConcurrenciaService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formPart = this.fragment as ConvocatoriaDatosGeneralesFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesEntidad = new FxFlexProperties();
    this.fxFlexPropertiesEntidad.sm = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.md = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.gtMd = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.order = '3';

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(36%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '4';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.regimenesConcurrencia$ = tipoRegimenConcurrenciaService.findAll().pipe(
      map(response => response.items)
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.setupI18N();
    if (!this.formPart.readonly) {
      this.convocatoriaAreaTematicas.paginator = this.paginator;
      this.convocatoriaAreaTematicas.sort = this.sort;
      this.subscriptions.push(this.formPart.areasTematicas$.subscribe(
        data => this.convocatoriaAreaTematicas.data = data
      ));
    }
  }

  private setupI18N(): void {
    this.translate.get(
      AREA_KEY,
      MSG_PARAMS.CARDINALIRY.PLURAL
    ).subscribe((value) => this.msgParamAreaEntities = { entity: value });

    this.translate.get(
      AREA_TEMATICA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamAreaTematicaEntity = { entity: value });

    this.translate.get(
      AREA_TEMATICA_KEY,
      MSG_PARAMS.CARDINALIRY.PLURAL
    ).subscribe((value) => this.msgParamAreaTematicaEntities = { entity: value });

    this.translate.get(
      CONVOCATORIA_CODIGO_REFERENCIA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe(
      (value) => this.msgParamCodigoReferenciaEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE, ...MSG_PARAMS.CARDINALIRY.SINGULAR }
    );

    this.translate.get(
      CONVOCATORIA_UNIDAD_GESTION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamUnidadGestionEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      CONVOCATORIA_FECHA_PUBLICACION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFechaPublicacionEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      CONVOCATORIA_FECHA_PROVISIONAL_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFechaProvisionalEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      CONVOCATORIA_FECHA_CONCESION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFechaConcesionEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      CONVOCATORIA_TITULO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamTituloEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE, ...MSG_PARAMS.CARDINALIRY.SINGULAR });

    this.translate.get(
      CONVOCATORIA_MODELO_EJECUCION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamModeloEjecucionEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      CONVOCATORIA_MODELO_EJECUCION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamModeloEjecucionEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      CONVOCATORIA_FINALIDAD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFinalidadEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      CONVOCATORIA_DURACION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamDuracionEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      CONVOCATORIA_AMBITO_GEOGRAFICO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamAmbitoGeograficoEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      CONVOCATORIA_DESCRIPCION_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamDescripcionEntity = {
      entity: value,
      ...MSG_PARAMS.GENDER.MALE,
      ...MSG_PARAMS.CARDINALIRY.SINGULAR
    });

    this.translate.get(
      CONVOCATORIA_OBSERVACIONES_KEY,
      MSG_PARAMS.CARDINALIRY.PLURAL
    ).subscribe((value) => this.msgParamObservacionesEntity = {
      entity: value,
      ...MSG_PARAMS.GENDER.FEMALE,
      ...MSG_PARAMS.CARDINALIRY.PLURAL
    });

    this.translate.get(
      AREA_TEMATICA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_DELETE_AREA_TEMATICA,
          { entity: value, ...MSG_PARAMS.GENDER.MALE }
        );
      })
    ).subscribe((value) => this.textoDeleteAreaTematica = value);
  }

  openModal(data?: AreaTematicaData): void {
    const newData: AreaTematicaData = {
      padre: undefined,
      observaciones: '',
      convocatoriaAreaTematica: new StatusWrapper<IConvocatoriaAreaTematica>({} as IConvocatoriaAreaTematica)
    };
    const config = {
      panelClass: 'sgi-dialog-container',
      data: data ? data : newData
    };
    const dialogRef = this.matDialog.open(ConvocatoriaAreaTematicaModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: AreaTematicaData) => {
        if (result) {
          if (data) {
            this.formPart.updateConvocatoriaAreaTematica(result);
          } else {
            this.formPart.addConvocatoriaAreaTematica(result);
          }
        }
      }
    );
  }

  deleteAreaTematica(data: AreaTematicaData): void {
    this.subscriptions.push(
      this.dialogService.showConfirmation(this.textoDeleteAreaTematica).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteConvocatoriaAreaTematica(data);
          }
        }
      )
    );
  }
}
