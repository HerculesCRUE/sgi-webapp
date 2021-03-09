import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { ISolicitudProyectoPeriodoPago } from '@core/models/csp/solicitud-proyecto-periodo-pago';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { SolicitudProyectoSocioPeriodoPagoModalComponent, SolicitudProyectoSocioPeriodoPagoModalData } from '../../modals/solicitud-proyecto-socio-periodo-pago-modal/solicitud-proyecto-socio-periodo-pago-modal.component';
import { SolicitudProyectoSocioActionService } from '../../solicitud-proyecto-socio.action.service';
import { SolicitudProyectoSocioPeriodoPagoFragment } from './solicitud-proyecto-socio-periodo-pago.fragment';

const MSG_DELETE = marker('csp.solicitud-proyecto-socio.periodo-pago.borrar');

@Component({
  selector: 'sgi-solicitud-proyecto-socio-periodo-pago',
  templateUrl: './solicitud-proyecto-socio-periodo-pago.component.html',
  styleUrls: ['./solicitud-proyecto-socio-periodo-pago.component.scss']
})
export class SolicitudProyectoSocioPeriodoPagoComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: SolicitudProyectoSocioPeriodoPagoFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['numPeriodo', 'mes', 'importe', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudProyectoPeriodoPago>>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: SolicitudProyectoSocioActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.PERIODOS_PAGOS, actionService);
    this.formPart = this.fragment as SolicitudProyectoSocioPeriodoPagoFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subcription = this.formPart.periodoPagos$.subscribe(
      (proyectoEquipos) => {
        this.dataSource.data = proyectoEquipos;
      }
    );
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (wrapper, property) => wrapper.value[property];
    this.subscriptions.push(subcription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(wrapper?: StatusWrapper<ISolicitudProyectoPeriodoPago>): void {
    const solicitudProyectoPeriodoPago: ISolicitudProyectoPeriodoPago = {
      id: undefined,
      importe: undefined,
      mes: undefined,
      numPeriodo: this.dataSource.data.length + 1,
      solicitudProyectoSocio: undefined
    };
    const data: SolicitudProyectoSocioPeriodoPagoModalData = {
      solicitudProyectoPeriodoPago: wrapper ? wrapper.value : solicitudProyectoPeriodoPago,
      selectedMeses: this.dataSource.data.map(element => element.value.mes),
      mesInicioSolicitudProyectoSocio: this.actionService.getSolicitudProyectoSocio().mesInicio,
      mesFinSolicitudProyectoSocio: this.actionService.getSolicitudProyectoSocio().mesFin,
      isEdit: Boolean(wrapper),
      readonly: this.formPart.readonly
    };
    if (wrapper) {
      const index = data.selectedMeses.findIndex((element) => element === wrapper.value.mes);
      if (index >= 0) {
        data.selectedMeses.splice(index, 1);
      }
    }
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(SolicitudProyectoSocioPeriodoPagoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (modalData: SolicitudProyectoSocioPeriodoPagoModalData) => {
        if (modalData) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addPeriodoPago(modalData.solicitudProyectoPeriodoPago);
          }
        }
      }
    );
  }

  deleteProyectoEquipo(wrapper: StatusWrapper<ISolicitudProyectoPeriodoPago>): void {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deletePeriodoPago(wrapper);
          }
        }
      )
    );
  }

}
