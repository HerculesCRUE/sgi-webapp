import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaHitosModalComponent, ConvocatoriaHitosModalComponentData } from '../../modals/convocatoria-hitos-modal/convocatoria-hitos-modal.component';
import { ConvocatoriaHitosFragment } from './convocatoria-hitos.fragment';

const MSG_DELETE = marker('csp.convocatoria.hito.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-hitos',
  templateUrl: './convocatoria-hitos.component.html',
  styleUrls: ['./convocatoria-hitos.component.scss']
})
export class ConvocatoriaHitosComponent extends FragmentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  formPart: ConvocatoriaHitosFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  public disableAddHito = true;

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['fechaInicio', 'tipoHito', 'comentario', 'aviso', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaHito>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected convocatoriaReunionService: ConvocatoriaService,
    private actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.HITOS, actionService);
    this.formPart = this.fragment as ConvocatoriaHitosFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaHito>, property: string) => {
        switch (property) {
          case 'fechaInicio':
            return wrapper.value.fecha;
          case 'tipoHito':
            return wrapper.value.tipoHito.nombre;
          case 'comentario':
            return wrapper.value.comentario;
          default:
            return wrapper[property];
        }
      };
    this.dataSource.sort = this.sort;
    this.disableAddHito = !Boolean(this.actionService.modeloEjecucionId);
    this.subscriptions.push(this.formPart.hitos$.subscribe(elements => {
      this.dataSource.data = elements;
    }));
  }

  /**
   * Apertura de modal de hitos (edición/creación)
   * @param idHito Identificador de hito a editar.
   */
  openModal(wrapper?: StatusWrapper<IConvocatoriaHito>): void {
    const data: ConvocatoriaHitosModalComponentData = {
      hitos: this.dataSource.data.map(hito => hito.value),
      hito: wrapper ? wrapper.value : {} as IConvocatoriaHito,
      idModeloEjecucion: this.actionService.modeloEjecucionId,
      readonly: this.formPart.readonly
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ConvocatoriaHitosModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (convocatoriaHito) => {
        if (convocatoriaHito) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addHito(convocatoriaHito);
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Desactivar convocatoria hito
   */
  deleteHito(wrapper: StatusWrapper<IConvocatoriaHito>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteHito(wrapper);
          }
        }
      )
    );
  }

}
