import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { FORMULARIO_SOLICITUD_MAP } from '@core/enums/formulario-solicitud';
import { IConfiguracionSolicitud } from '@core/models/csp/configuracion-solicitud';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IDocumentoRequerido } from '@core/models/csp/documentos-requeridos-solicitud';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaConfiguracionSolicitudesModalComponent, ConvocatoriaConfiguracionSolicitudesModalData } from '../../modals/convocatoria-configuracion-solicitudes-modal/convocatoria-configuracion-solicitudes-modal.component';
import { ConvocatoriaConfiguracionSolicitudesFragment } from './convocatoria-configuracion-solicitudes.fragment';

const MSG_DELETE = marker('csp.convocatoria.configuracionSolicitud.listado.borrar');
const MSG_ERROR_INIT = marker('csp.convocatoria.configuracionSolicitud.error.cargar');

@Component({
  selector: 'sgi-convocatoria-configuracion-solicitudes',
  templateUrl: './convocatoria-configuracion-solicitudes.component.html',
  styleUrls: ['./convocatoria-configuracion-solicitudes.component.scss']
})
export class ConvocatoriaConfiguracionSolicitudesComponent extends
  FormFragmentComponent<IConfiguracionSolicitud> implements OnInit, OnDestroy {
  formPart: ConvocatoriaConfiguracionSolicitudesFragment;
  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesOne: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxFlexPropertiesEntidad: FxFlexProperties;

  get FORMULARIO_SOLICITUD_MAP() {
    return FORMULARIO_SOLICITUD_MAP;
  }

  columns = ['nombre', 'descripcion', 'observaciones', 'acciones'];
  numPage = [5, 10, 25, 100];
  convocatoriaFase: IConvocatoriaFase;

  dataSource = new MatTableDataSource<StatusWrapper<IDocumentoRequerido>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subscriptions: Subscription[] = [];

  private convocatoriaFaseFiltered = [] as IConvocatoriaFase[];
  convocatoriaFase$: Observable<IConvocatoriaFase[]>;
  configuracionSolicitud: IConfiguracionSolicitud;

  disabledPlazoPresentacion: Observable<boolean>;

  constructor(
    private readonly logger: NGXLogger,
    protected actionService: ConvocatoriaActionService,
    public translate: TranslateService,
    private matDialog: MatDialog,
    private convocatoriaService: ConvocatoriaService,
    private dialogService: DialogService,
    private snackBarService: SnackBarService
  ) {
    super(actionService.FRAGMENT.CONFIGURACION_SOLICITUDES, actionService);

    this.formPart = this.fragment as ConvocatoriaConfiguracionSolicitudesFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '1';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '4';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadConvocatoriaFases();
    this.initializeDataSource();

    this.actionService.initializePlazosFases();

    this.subscriptions.push(this.formPart.documentosRequeridos$.subscribe(elements => {
      this.dataSource.data = elements;
      this.disabledPlazoPresentacion = of(elements.length > 0);
    }));
  }

  private initializeDataSource(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IDocumentoRequerido>, property: string) => {
        switch (property) {
          case 'nombre':
            return wrapper.value.tipoDocumento.nombre;
          case 'descripcion':
            return wrapper.value.tipoDocumento.descripcion;
          case 'observaciones':
            return wrapper.value.observaciones;
          default:
            return wrapper[property];
        }
      };
    this.dataSource.sort = this.sort;
  }

  /**
   * Cargamos fases asignadas a la convocatoria
   * del fragment
   */
  loadConvocatoriaFases(): void {
    if (this.actionService.isPlazosFasesInitialized()) {
      this.convocatoriaFaseFiltered = [];
      this.actionService.getPlazosFases().forEach((wrapper) => {
        this.convocatoriaFaseFiltered.push(wrapper.value);
      });
    } else {
      const id = Number(this.formPart.getKey());
      if (id && !isNaN(id)) {
        this.subscriptions.push(
          this.convocatoriaService.findAllConvocatoriaFases(id).subscribe(
            res => {
              this.convocatoriaFaseFiltered = [];
              this.convocatoriaFaseFiltered = res.items;
            },
            (error) => {
              this.logger.error(error);
              this.snackBarService.showError(MSG_ERROR_INIT);
            }
          )
        );
      }
    }

    this.convocatoriaFase$ = this.formGroup.controls.fasePresentacionSolicitudes.valueChanges
      .pipe(
        startWith(''),
        map(value =>
          this.filtroConvocatoriaFase(value)
        )
      );
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroConvocatoriaFase(value: string): IConvocatoriaFase[] {
    const filterValue = value?.toString().toLowerCase();
    return this.convocatoriaFaseFiltered.filter(convocatoriaFase =>
      convocatoriaFase.tipoFase.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Si solicitudes SGI es -SI-
   * El campo presentación es obligatorio
   */
  presentacionSolicitud() {
    if (!this.formGroup.controls.tramitacionSGI.value) {
      this.formGroup.controls.fasePresentacionSolicitudes.setErrors(null);
    }
    return this.formGroup.controls.tramitacionSGI.value;
  }

  /**
   * Devuelve el nombre de un Tipo Formulario Solicitud.
   * @param formulario tipo formulario solicitud.
   * @returns nombre de un tipo formulario solicitud.
   */
  getFormularioSolicitud(convocatoriaFase?: IConvocatoriaFase): string | undefined {
    return typeof convocatoriaFase === 'string' ? convocatoriaFase : convocatoriaFase?.tipoFase.nombre;
  }

  /**
   * Filtramos por el ID del seleccionado.
   * Rellenos los campos FECHA correspondientes
   */
  habilitarCampos(): void {
    const tipoFase = this.formGroup.controls.fasePresentacionSolicitudes.value;

    const fechaInicio = typeof tipoFase?.fechaInicio === 'string' ?
      new Date(tipoFase?.fechaInicio) : tipoFase?.fechaInicio;

    const fechaFin = typeof tipoFase?.fechaFin === 'string' ?
      new Date(tipoFase?.fechaFin) : tipoFase?.fechaFin;

    if (tipoFase) {
      this.convocatoriaFase = tipoFase;
      this.formGroup.controls.fechaInicioFase.setValue(fechaInicio);
      this.formGroup.controls.fechaFinFase.setValue(fechaFin);
    } else {
      this.formGroup.controls.fechaInicioFase.setValue('');
      this.formGroup.controls.fechaFinFase.setValue('');
    }
  }



  /**
   * Abre modal con el modelo convocatoria enlace seleccionada
   * @param wrapper convocatoria enlace
   */
  openModal(wrapper?: StatusWrapper<IDocumentoRequerido>): void {
    const tipoFase: ITipoFase = this.formGroup.controls.fasePresentacionSolicitudes.value.tipoFase;
    if (this.configuracionSolicitud) {
      this.configuracionSolicitud.fasePresentacionSolicitudes.tipoFase = tipoFase;
    }
    const documentosRequerido: IDocumentoRequerido = {
      configuracionSolicitud: this.formPart.getValue(),
      id: undefined,
      observaciones: undefined,
      tipoDocumento: undefined,
    };

    const modeloEjecucionId = documentosRequerido.configuracionSolicitud?.convocatoria?.modeloEjecucion?.id
      ? documentosRequerido.configuracionSolicitud.convocatoria.modeloEjecucion.id : this.actionService.modeloEjecucionId;

    const data: ConvocatoriaConfiguracionSolicitudesModalData = {
      documentoRequerido: wrapper ? wrapper.value : documentosRequerido,
      modeloEjecucionId,
      readonly: this.formPart.readonly
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ConvocatoriaConfiguracionSolicitudesModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ConvocatoriaConfiguracionSolicitudesModalData) => {
        if (result) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addDocumentoRequerido(result.documentoRequerido);
          }
          this.subscriptions.push(this.formPart.documentosRequeridos$.subscribe(elements => {
            this.dataSource.data = elements;
          })
          );
        }
      }
    );
  }

  /**
   * Desactivar documento
   */
  deactivateDocumento(wrapper: StatusWrapper<IDocumentoRequerido>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteDocumentoRequerido(wrapper);
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
