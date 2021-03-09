import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { ModeloEjecucionTipoFaseModalComponent, ModeloEjecucionTipoFaseModalData } from '../../modals/modelo-ejecucion-tipo-fase-modal/modelo-ejecucion-tipo-fase-modal.component';
import { ModeloEjecucionActionService } from '../../modelo-ejecucion.action.service';
import { ModeloEjecucionTipoFaseFragment } from './modelo-ejecucion-tipo-fase.fragment';

const MSG_DELETE = marker('csp.modelo.ejecucion.tipo.fase.listado.borrar');

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-fase',
  templateUrl: './modelo-ejecucion-tipo-fase.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-fase.component.scss']
})
export class ModeloEjecucionTipoFaseComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ModeloEjecucionTipoFaseFragment;
  private subscriptions = [] as Subscription[];

  columns = ['nombre', 'descripcion', 'convocatorias', 'proyectos', 'acciones'];
  numPage = [5, 10, 25, 100];

  modelosTipoFases = new MatTableDataSource<StatusWrapper<IModeloTipoFase>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  constructor(
    private dialogService: DialogService,
    private matDialog: MatDialog,
    actionService: ModeloEjecucionActionService
  ) {
    super(actionService.FRAGMENT.TIPO_FASES, actionService);
    this.formPart = this.fragment as ModeloEjecucionTipoFaseFragment;
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subscription = this.formPart.modeloTipoFase$.subscribe(
      wrappers => this.modelosTipoFases.data = wrappers);
    this.subscriptions.push(subscription);
    this.modelosTipoFases.paginator = this.paginator;
    this.modelosTipoFases.sortingDataAccessor =
      (wrapper: StatusWrapper<IModeloTipoFase>, property: string) => {
        switch (property) {
          case 'nombre':
            return wrapper.value.tipoFase.nombre;
          case 'descripcion':
            return wrapper.value.tipoFase.descripcion;
          case 'convocatorias':
            return wrapper.value.convocatoria;
          case 'proyectos':
            return wrapper.value.proyecto;
          default:
            return wrapper[property];
        }
      };
    this.modelosTipoFases.sort = this.sort;
  }

  /**
   * Abre el modal para crear/modificar
   */
  openModal(statusWrapper?: StatusWrapper<IModeloTipoFase>): void {
    const modeloTipoFase: IModeloTipoFase = {
      activo: true,
      convocatoria: false,
      solicitud: false,
      proyecto: false,
      id: undefined,
      modeloEjecucion: undefined,
      tipoFase: undefined
    };
    const tipoFases: ITipoFase[] = [];
    this.modelosTipoFases.data.forEach(wrapper => tipoFases.push(wrapper.value.tipoFase));
    const data: ModeloEjecucionTipoFaseModalData = {
      modeloTipoFase: statusWrapper ? statusWrapper.value : modeloTipoFase,
      tipoFases
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ModeloEjecucionTipoFaseModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: IModeloTipoFase) => {
        if (result) {
          if (statusWrapper) {
            if (!statusWrapper.created) {
              statusWrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addModeloTipoFase(result);
          }
        }
      }
    );
  }

  /**
   * Borra el tipo modelo fase correspondiente
   */
  deleteModeloTipoFase(wrapper: StatusWrapper<IModeloTipoFase>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteModeloTipoFase(wrapper);
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
