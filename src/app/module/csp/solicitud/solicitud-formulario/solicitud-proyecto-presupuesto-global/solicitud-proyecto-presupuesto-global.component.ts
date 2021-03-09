import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { ISolicitudProyectoPresupuesto } from '@core/models/csp/solicitud-proyecto-presupuesto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { PartidaGastoModalComponent, PartidaGastoDataModal } from '../../../modals/partida-gasto-modal/partida-gasto-modal.component';
import { SolicitudActionService } from '../../solicitud.action.service';
import { SolicitudProyectoPresupuestoGlobalFragment } from './solicitud-proyecto-presupuesto-global.fragment';

const MSG_DELETE = marker('csp.solicitud.desglose-presupuesto-global.borrar');

@Component({
  selector: 'sgi-solicitud-proyecto-presupuesto-global',
  templateUrl: './solicitud-proyecto-presupuesto-global.component.html',
  styleUrls: ['./solicitud-proyecto-presupuesto-global.component.scss']
})
export class SolicitudProyectoPresupuestoGlobalComponent extends FragmentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  formPart: SolicitudProyectoPresupuestoGlobalFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = [
    'conceptoGasto',
    'anualidad',
    'importe',
    'observaciones',
    'acciones'
  ];
  elementsPage = [5, 10, 25, 100];

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudProyectoPresupuesto>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: SolicitudActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.DESGLOSE_PRESUPUESTO_GLOBAL, actionService);
    this.formPart = this.fragment as SolicitudProyectoPresupuestoGlobalFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.actionService.existsDatosProyectos();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor =
      (partidaGasto: StatusWrapper<ISolicitudProyectoPresupuesto>, property: string) => {
        switch (property) {
          case 'conceptoGasto':
            return partidaGasto.value.conceptoGasto?.nombre;
          case 'anualidad':
            return partidaGasto.value.anualidad;
          case 'importe':
            return partidaGasto.value.importeSolicitado;
          case 'observaciones':
            return partidaGasto.value.observaciones;
          default:
            return partidaGasto[property];
        }
      };

    const subcription = this.formPart.partidasGastos$
      .subscribe((partidasGasto) => {
        this.dataSource.data = partidasGasto;
      });
    this.subscriptions.push(subcription);
    this.actionService.hasDesglosePresupuesto();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  deletePartidaGasto(wrapper: StatusWrapper<ISolicitudProyectoPresupuesto>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deletePartidaGasto(wrapper);
          }
        }
      )
    );
  }

  openModal(wrapper?: StatusWrapper<ISolicitudProyectoPresupuesto>): void {
    const data: PartidaGastoDataModal = {
      partidaGasto: wrapper ? wrapper.value : {} as ISolicitudProyectoPresupuesto,
      convocatoriaId: this.actionService.getDatosGeneralesSolicitud().convocatoria?.id,
      readonly: this.formPart.readonly
    };

    const config = {
      data
    };

    const dialogRef = this.matDialog.open(PartidaGastoModalComponent, config);
    dialogRef.afterClosed().subscribe((partidaGasto) => {
      if (partidaGasto) {
        if (!wrapper) {
          this.formPart.addPartidaGasto(partidaGasto);
        } else if (!wrapper.created) {
          const wrapperUpdated = new StatusWrapper<ISolicitudProyectoPresupuesto>(wrapper.value);
          this.formPart.updatePartidaGasto(wrapperUpdated);
        }
      }
    });
  }

}
