import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IModeloTipoDocumento } from '@core/models/csp/modelo-tipo-documento';
import { ITipoDocumento, ITipoFase } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { ModeloEjecucionTipoDocumentoModalComponent, ModeloTipoDocumentoModalData } from '../../modals/modelo-ejecucion-tipo-documento-modal/modelo-ejecucion-tipo-documento-modal.component';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';
import { ModeloEjecucionTipoDocumentoFragment } from './modelo-ejecucion-tipo-documento.fragment';

const MSG_DELETE = marker('csp.modelo.ejecucion.tipo.documento.listado.borrar');

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-documento',
  templateUrl: './modelo-ejecucion-tipo-documento.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-documento.component.scss']
})
export class ModeloEjecucionTipoDocumentoComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ModeloEjecucionTipoDocumentoFragment;
  private subscriptions = [] as Subscription[];

  columns = ['nombre', 'descripcion', 'nombreFase', 'acciones'];
  numPage = [5, 10, 25, 100];

  modelosTipoDocumentos = new MatTableDataSource<StatusWrapper<IModeloTipoDocumento>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  constructor(
    protected logger: NGXLogger,
    private dialogService: DialogService,
    private matDialog: MatDialog,
    private actionService: ModeloEjecucionActionService
  ) {
    super(actionService.FRAGMENT.TIPO_DOCUMENTOS, actionService);
    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.formPart = this.fragment as ModeloEjecucionTipoDocumentoFragment;

    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, 'ngOnInit()', 'start');
    const subscription = this.formPart.modeloTipoDocumento$.subscribe(
      (wrappers: StatusWrapper<IModeloTipoDocumento>[]) => {
        this.modelosTipoDocumentos.data = wrappers;
      }
    );
    this.modelosTipoDocumentos.paginator = this.paginator;
    this.modelosTipoDocumentos.sort = this.sort;
    this.subscriptions.push(subscription);
    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, 'ngOnDestroy()', 'end');
  }

  openModal(): void {
    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, `openModal()`, 'start');
    const modeloTipoDocumento: IModeloTipoDocumento = {
      activo: true,
      id: undefined,
      modeloEjecucion: undefined,
      modeloTipoFase: undefined,
      tipoDocumento: undefined
    };
    const tipoDocumentos: ITipoDocumento[] = [];
    const selectedTipoFases: ITipoFase[] = [];
    this.modelosTipoDocumentos.data.forEach(wrapper => {
      tipoDocumentos.push(wrapper.value.tipoDocumento);
      if (wrapper.value.modeloTipoFase) {
        selectedTipoFases.push(wrapper.value.modeloTipoFase.tipoFase);
      }
    });
    let availableTipoFases = this.actionService.getTipoFases();
    availableTipoFases = availableTipoFases.filter(availableTipoFase => {
      return selectedTipoFases.find((currentTipo) =>
        currentTipo.id === availableTipoFase.id) ? false : true;
    });
    const data: ModeloTipoDocumentoModalData = {
      modeloTipoDocumento,
      tipoDocumentos,
      tipoFases: availableTipoFases,
      id: this.formPart.getKey() as number
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ModeloEjecucionTipoDocumentoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: IModeloTipoDocumento) => {
        if (result) {
          this.formPart.addModeloTipoDocumento(result);
        }
        this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name, `openModal()`, 'end');
      }
    );
  }

  deleteModeloTipoDocumento(wrapper: StatusWrapper<IModeloTipoDocumento>) {
    this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name,
      `deleteModeloTipoDocumento(${wrapper})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteModeloTipoDocumento(wrapper);
          }
          this.logger.debug(ModeloEjecucionTipoDocumentoComponent.name,
            `deleteModeloTipoDocumento(${wrapper})`, 'end');
        }
      )
    );
  }
}

