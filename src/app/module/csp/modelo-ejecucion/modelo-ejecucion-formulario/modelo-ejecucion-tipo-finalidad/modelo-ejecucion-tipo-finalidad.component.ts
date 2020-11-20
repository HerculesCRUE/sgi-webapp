import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IModeloTipoFinalidad } from '@core/models/csp/modelo-tipo-finalidad';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';
import { ModeloEjecucionTipoFinalidadModalComponent, ModeloEjecucionTipoFinalidadModalData } from '../../modals/modelo-ejecucion-tipo-finalidad-modal/modelo-ejecucion-tipo-finalidad-modal.component';
import { ModeloEjecucionTipoFinalidadFragment } from './modelo-ejecucion-tipo-finalidad.fragment';
import { ITipoFinalidad } from '@core/models/csp/tipos-configuracion';

const MSG_DELETE = marker('csp.modelo.ejecucion.tipo.finalidad.listado.borrar');

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-finalidad',
  templateUrl: './modelo-ejecucion-tipo-finalidad.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-finalidad.component.scss']
})
export class ModeloEjecucionTipoFinalidadComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ModeloEjecucionTipoFinalidadFragment;
  private subscriptions = [] as Subscription[];

  columns = ['nombre', 'descripcion', 'acciones'];
  numPage = [5, 10, 25, 100];
  totalElements = 0;

  modelosTipoFinalidades = new MatTableDataSource<StatusWrapper<IModeloTipoFinalidad>>();
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
    super(actionService.FRAGMENT.TIPO_FINALIDADES, actionService);
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.formPart = this.fragment as ModeloEjecucionTipoFinalidadFragment;
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, 'ngOnInit()', 'start');
    const subscription = this.formPart.modeloTipoFinalidad$.subscribe(
      (wrappers: StatusWrapper<IModeloTipoFinalidad>[]) => {
        this.modelosTipoFinalidades.data = wrappers;
      }
    );
    this.modelosTipoFinalidades.paginator = this.paginator;
    this.modelosTipoFinalidades.sortingDataAccessor =
      (wrapper: StatusWrapper<IModeloTipoFinalidad>, property: string) => {
        switch (property) {
          case 'nombre':
            return wrapper.value.tipoFinalidad.nombre;
          case 'descripcion':
            return wrapper.value.tipoFinalidad.descripcion;
          case 'activo':
            return wrapper.value.tipoFinalidad.activo;
          default:
            return wrapper[property];
        }
      };
    this.modelosTipoFinalidades.sort = this.sort;
    this.subscriptions.push(subscription);
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, 'ngOnDestroy()', 'end');
  }

  openModal(): void {
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, `${this.openModal.name}()`, 'start');
    const modeloTipoFinalidad = { activo: true } as IModeloTipoFinalidad;
    const tipoFinalidades: ITipoFinalidad[] = [];
    this.modelosTipoFinalidades.data.forEach(
      (wrapper: StatusWrapper<IModeloTipoFinalidad>) => {
        tipoFinalidades.push(wrapper.value.tipoFinalidad);
      }
    );
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: { modeloTipoFinalidad, tipoFinalidades } as ModeloEjecucionTipoFinalidadModalData
    };
    const dialogRef = this.matDialog.open(ModeloEjecucionTipoFinalidadModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: IModeloTipoFinalidad) => {
        if (result) {
          this.formPart.addModeloTipoFinalidad(result);
        }
        this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name, `${this.openModal.name}()`, 'end');
      }
    );
  }

  deleteModeloTipoFinalidad(wrapper?: StatusWrapper<IModeloTipoFinalidad>): void {
    this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name,
      `${this.deleteModeloTipoFinalidad.name}(${wrapper})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteModeloTipoFinalidad(wrapper);
          }
          this.logger.debug(ModeloEjecucionTipoFinalidadComponent.name,
            `${this.deleteModeloTipoFinalidad.name}(${wrapper})`, 'end');
        }
      )
    );
  }
}
