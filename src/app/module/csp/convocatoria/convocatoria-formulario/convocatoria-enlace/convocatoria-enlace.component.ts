import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NGXLogger } from 'ngx-logger';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { FragmentComponent } from '@core/component/fragment.component';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { ConvocatoriaEnlaceFragment } from './convocatoria-enlace.fragment';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { ConvocatoriaEnlaceModalComponent, ConvocatoriaEnlaceModalComponentData } from '../../modals/convocatoria-enlace-modal/convocatoria-enlace-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@core/services/dialog.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const MSG_DELETE = marker('csp.convocatoria.enlace.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-enlace',
  templateUrl: './convocatoria-enlace.component.html',
  styleUrls: ['./convocatoria-enlace.component.scss']
})
export class ConvocatoriaEnlaceComponent extends FragmentComponent implements OnInit, OnDestroy {

  private formPart: ConvocatoriaEnlaceFragment;
  private subscriptions: Subscription[] = [];
  public disableAddEnlace = true;

  totalElementos: number;
  elementosPagina: number[] = [5, 10, 25, 100];
  displayedColumns: string[] = ['url', 'descripcion', 'tipoEnlace', 'acciones'];

  dataSource: MatTableDataSource<StatusWrapper<IConvocatoriaEnlace>> = new MatTableDataSource<StatusWrapper<IConvocatoriaEnlace>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected readonly logger: NGXLogger,
    private actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.ENLACES, actionService);
    this.logger.debug(ConvocatoriaEnlaceComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaEnlaceFragment;
    this.logger.debug(ConvocatoriaEnlaceComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaEnlaceComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.totalElementos = 0;
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
      this.logger.debug(ConvocatoriaEnlaceComponent.name, 'ngOnInit()', 'end');
    }));
  }

  /**
   * Abre modal con el modelo convocatoria enlace seleccionada
   * @param wrapper convocatoria enlace
   */
  openModal(wrapper?: StatusWrapper<IConvocatoriaEnlace>): void {
    this.logger.debug(ConvocatoriaEnlaceComponent.name, `${this.openModal.name}()`, 'start');
    const datosEnlace = {
      enlace: wrapper ? wrapper.value : {} as IConvocatoriaEnlace,
      idModeloEjecucion: this.actionService.modeloEjecucionId
    } as ConvocatoriaEnlaceModalComponentData;
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: datosEnlace
    };
    const dialogRef = this.matDialog.open(ConvocatoriaEnlaceModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (convocatoriaEnlace: IConvocatoriaEnlace) => {
        if (convocatoriaEnlace) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addEnlace(convocatoriaEnlace);
          }
        }
        this.logger.debug(ConvocatoriaEnlaceModalComponent.name, `${this.openModal.name}()`, 'end');
      }
    );
  }

  /**
   * Desactivar convocatoria enlace
   */
  deleteEnlace(wrapper: StatusWrapper<IConvocatoriaEnlace>) {
    this.logger.debug(ConvocatoriaEnlaceModalComponent.name,
      `${this.deleteEnlace.name}(${wrapper})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteEnlace(wrapper);
          }
          this.logger.debug(ConvocatoriaEnlaceModalComponent.name,
            `${this.deleteEnlace.name}(${wrapper})`, 'end');
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaEnlaceComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaEnlaceComponent.name, 'ngOnDestroy()', 'end');
  }

}

