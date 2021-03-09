import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IModeloTipoEnlace } from '@core/models/csp/modelo-tipo-enlace';
import { ITipoEnlace } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { ModeloEjecucionTipoEnlaceModalComponent, ModeloEjecucionTipoEnlaceModalData } from '../../modals/modelo-ejecucion-tipo-enlace-modal/modelo-ejecucion-tipo-enlace-modal.component';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';
import { ModeloEjecucionTipoEnlaceFragment } from './modelo-ejecucion-tipo-enlace.fragment';

const MSG_DELETE = marker('csp.modelo.ejecucion.tipo.enlace.listado.borrar');

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-enlace',
  templateUrl: './modelo-ejecucion-tipo-enlace.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-enlace.component.scss']
})
export class ModeloEjecucionTipoEnlaceComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ModeloEjecucionTipoEnlaceFragment;
  private subscriptions = [] as Subscription[];

  columns = ['nombre', 'descripcion', 'acciones'];
  numPage = [5, 10, 25, 100];
  totalElements = 0;

  modelosTipoEnlaces = new MatTableDataSource<StatusWrapper<IModeloTipoEnlace>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  constructor(
    private readonly dialogService: DialogService,
    private matDialog: MatDialog,
    actionService: ModeloEjecucionActionService
  ) {
    super(actionService.FRAGMENT.TIPO_ENLACES, actionService);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.formPart = this.fragment as ModeloEjecucionTipoEnlaceFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subscription = this.formPart.modeloTipoEnlace$.subscribe(
      (wrappers: StatusWrapper<IModeloTipoEnlace>[]) => {
        this.modelosTipoEnlaces.data = wrappers;
      }
    );
    this.modelosTipoEnlaces.paginator = this.paginator;
    this.modelosTipoEnlaces.sortingDataAccessor =
      (wrapper: StatusWrapper<IModeloTipoEnlace>, property: string) => {
        switch (property) {
          case 'nombre':
            return wrapper.value.tipoEnlace.nombre;
          case 'descripcion':
            return wrapper.value.tipoEnlace.descripcion;
          case 'activo':
            return wrapper.value.tipoEnlace.activo;
          default:
            return wrapper[property];
        }
      };
    this.modelosTipoEnlaces.sort = this.sort;
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(): void {
    const modeloTipoEnlace = { activo: true } as IModeloTipoEnlace;

    const tipoEnlaces: ITipoEnlace[] = [];
    this.modelosTipoEnlaces.data.forEach((wrapper: StatusWrapper<IModeloTipoEnlace>) => {
      tipoEnlaces.push(wrapper.value.tipoEnlace);
    });

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: { modeloTipoEnlace, tipoEnlaces } as ModeloEjecucionTipoEnlaceModalData
    };
    const dialogRef = this.matDialog.open(ModeloEjecucionTipoEnlaceModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: IModeloTipoEnlace) => {
        if (result) {
          this.formPart.addModeloTipoEnlace(result);
        }
      }
    );
  }

  deleteModeloTipoEnlace(wrapper: StatusWrapper<IModeloTipoEnlace>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteModeloTipoEnlace(wrapper);
          }
        }
      )
    );
  }
}
