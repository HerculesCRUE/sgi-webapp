import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IModeloTipoHito } from '@core/models/csp/modelo-tipo-hito';
import { ITipoHito } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { ModeloEjecucionTipoHitoModalComponent, ModeloEjecucionTipoHitoModalData } from '../../modals/modelo-ejecucion-tipo-hito-modal/modelo-ejecucion-tipo-hito-modal.component';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';
import { ModeloEjecucionTipoHitoFragment } from './modelo-ejecucion-tipo-hito.fragment';

const MSG_DELETE = marker('csp.modelo.ejecucion.tipo.hito.listado.borrar');

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-hito',
  templateUrl: './modelo-ejecucion-tipo-hito.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-hito.component.scss']
})
export class ModeloEjecucionTipoHitoComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ModeloEjecucionTipoHitoFragment;
  private subscriptions = [] as Subscription[];

  columns = ['nombre', 'descripcion', 'convocatorias', 'solicitudes', 'proyectos', 'acciones'];
  numPage = [5, 10, 25, 100];
  totalElements = 0;

  modelosTipoHitos = new MatTableDataSource<StatusWrapper<IModeloTipoHito>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly dialogService: DialogService,
    private matDialog: MatDialog,
    actionService: ModeloEjecucionActionService
  ) {
    super(actionService.FRAGMENT.TIPO_HITOS, actionService);
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.formPart = this.fragment as ModeloEjecucionTipoHitoFragment;
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name, 'ngOnInit()', 'start');
    const subscription = this.formPart.modeloTipoHito$.subscribe(
      (wrappers: StatusWrapper<IModeloTipoHito>[]) => {
        this.modelosTipoHitos.data = wrappers;
      }
    );
    this.subscriptions.push(subscription);
    this.modelosTipoHitos.paginator = this.paginator;
    this.modelosTipoHitos.sortingDataAccessor =
      (wrapper: StatusWrapper<IModeloTipoHito>, property: string) => {
        switch (property) {
          case 'nombre':
            return wrapper.value.tipoHito.nombre;
          case 'descripcion':
            return wrapper.value.tipoHito.descripcion;
          case 'activo':
            return wrapper.value.tipoHito.activo;
          default:
            return wrapper[property];
        }
      };
    this.modelosTipoHitos.sort = this.sort;
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Abre el modal para crear/modificar
   */
  openModal(statusWrapper?: StatusWrapper<IModeloTipoHito>): void {
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name,
      `${this.openModal.name}(modeloTipoHito?: ${JSON.stringify(statusWrapper)})`, 'start');
    const modeloTipoHito = {
      activo: true,
      convocatoria: false,
      solicitud: false,
      proyecto: false
    } as IModeloTipoHito;
    const tipoHitos: ITipoHito[] = [];
    this.modelosTipoHitos.data.forEach((wrapper: StatusWrapper<IModeloTipoHito>) => {
      tipoHitos.push(wrapper.value.tipoHito);
    });

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: {
        modeloTipoHito: statusWrapper ? statusWrapper.value : modeloTipoHito,
        tipoHitos
      } as ModeloEjecucionTipoHitoModalData
    };
    const dialogRef = this.matDialog.open(ModeloEjecucionTipoHitoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: IModeloTipoHito) => {
        if (result) {
          if (statusWrapper) {
            if (!statusWrapper.created) {
              statusWrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addModeloTipoHito(result);
          }
        }
        this.logger.debug(ModeloEjecucionTipoHitoComponent.name,
          `${this.openModal.name}(modeloTipoHito?: ${JSON.stringify(statusWrapper)})`, 'end');
      }
    );
  }

  deleteModeloTipoHito(wrapper: StatusWrapper<IModeloTipoHito>) {
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name,
      `${this.deleteModeloTipoHito.name}(${wrapper})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteModeloTipoHito(wrapper);
          }
          this.logger.debug(ModeloEjecucionTipoHitoComponent.name,
            `${this.deleteModeloTipoHito.name}(${wrapper})`, 'end');
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ModeloEjecucionTipoHitoComponent.name, 'ngOnDestroy()', 'end');
  }

}

