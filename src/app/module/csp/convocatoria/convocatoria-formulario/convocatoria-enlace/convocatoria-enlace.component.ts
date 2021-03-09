import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaEnlaceModalComponent, ConvocatoriaEnlaceModalComponentData } from '../../modals/convocatoria-enlace-modal/convocatoria-enlace-modal.component';
import { ConvocatoriaEnlaceFragment } from './convocatoria-enlace.fragment';

const MSG_DELETE = marker('csp.convocatoria.enlace.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-enlace',
  templateUrl: './convocatoria-enlace.component.html',
  styleUrls: ['./convocatoria-enlace.component.scss']
})
export class ConvocatoriaEnlaceComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: ConvocatoriaEnlaceFragment;
  private subscriptions: Subscription[] = [];
  disableAddEnlace = true;

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['url', 'descripcion', 'tipoEnlace', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaEnlace>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService,
  ) {
    super(actionService.FRAGMENT.ENLACES, actionService);
    this.formPart = this.fragment as ConvocatoriaEnlaceFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaEnlace>, property: string) => {
        switch (property) {
          case 'url':
            return wrapper.value.url;
          case 'descripcion':
            return wrapper.value.descripcion;
          case 'tipoEnlace':
            return wrapper.value.tipoEnlace.nombre;
          default:
            return wrapper[property];
        }
      };
    this.disableAddEnlace = !Boolean(this.actionService.modeloEjecucionId);
    this.dataSource.sort = this.sort;
    this.subscriptions.push(this.formPart.enlace$.subscribe(elements => {
      this.dataSource.data = elements;
    }));
  }

  /**
   * Abre modal con el modelo convocatoria enlace seleccionada
   * @param wrapper convocatoria enlace
   */
  openModal(wrapper?: StatusWrapper<IConvocatoriaEnlace>): void {
    const enlace: IConvocatoriaEnlace = {
      activo: true,
      convocatoria: undefined,
      descripcion: undefined,
      id: undefined,
      tipoEnlace: undefined,
      url: undefined
    };
    const data: ConvocatoriaEnlaceModalComponentData = {
      enlace: wrapper ? wrapper.value : enlace,
      idModeloEjecucion: this.actionService.modeloEjecucionId,
      selectedUrls: this.formPart.getSelectedUrls(),
      readonly: this.formPart.readonly
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ConvocatoriaEnlaceModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ConvocatoriaEnlaceModalComponentData) => {
        if (result) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addEnlace(result.enlace);
          }
        }
      }
    );
  }

  /**
   * Desactivar convocatoria enlace
   */
  deleteEnlace(wrapper: StatusWrapper<IConvocatoriaEnlace>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteEnlace(wrapper);
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}

