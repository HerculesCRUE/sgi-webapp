import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IProyectoSocioPeriodoPago } from '@core/models/csp/proyecto-socio-periodo-pago';
import { DialogService } from '@core/services/dialog.service';
import { DateUtils } from '@core/utils/date-utils';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { ProyectoSocioPeriodoPagoModalComponent, ProyectoSocioPeriodoPagoModalData } from '../../modals/proyecto-socio-periodo-pago-modal/proyecto-socio-periodo-pago-modal.component';
import { ProyectoSocioActionService } from '../../proyecto-socio.action.service';
import { ProyectoSocioPeriodoPagoFragment } from './proyecto-socio-periodo-pago.fragment';

const MSG_DELETE = marker('csp.proyecto-socio.periodo-pago.borrar');

@Component({
  selector: 'sgi-proyecto-socio-periodo-pago',
  templateUrl: './proyecto-socio-periodo-pago.component.html',
  styleUrls: ['./proyecto-socio-periodo-pago.component.scss']
})
export class ProyectoSocioPeriodoPagoComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: ProyectoSocioPeriodoPagoFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['numPeriodo', 'fechaPrevistaPago', 'importe', 'fechaPago', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<IProyectoSocioPeriodoPago>>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: ProyectoSocioActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.PERIODO_PAGO, actionService);
    this.formPart = this.fragment as ProyectoSocioPeriodoPagoFragment;
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

  openModal(wrapper?: StatusWrapper<IProyectoSocioPeriodoPago>): void {
    const proyectoSocioPeriodoPago: IProyectoSocioPeriodoPago = {
      id: undefined,
      importe: undefined,
      fechaPago: undefined,
      fechaPrevistaPago: undefined,
      numPeriodo: this.dataSource.data.length + 1,
      proyectoSocio: undefined
    };
    const fechaInicioProyectoSocio = DateUtils.fechaToDate(this.actionService.getProyectoSocio()?.fechaInicio);
    const fechaFinProyectoSocio = DateUtils.fechaToDate(this.actionService.getProyectoSocio()?.fechaFin);
    const data: ProyectoSocioPeriodoPagoModalData = {
      proyectoSocioPeriodoPago: wrapper ? wrapper.value : proyectoSocioPeriodoPago,
      selectedFechaPrevistas: this.dataSource.data.map(element => element.value.fechaPrevistaPago),
      fechaInicioProyectoSocio,
      fechaFinProyectoSocio,
      isEdit: Boolean(wrapper)
    };
    if (wrapper) {
      const index = data.selectedFechaPrevistas.findIndex((element) => element === wrapper.value.fechaPrevistaPago);
      if (index >= 0) {
        data.selectedFechaPrevistas.splice(index, 1);
      }
    }
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(ProyectoSocioPeriodoPagoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (modalData: ProyectoSocioPeriodoPagoModalData) => {
        if (modalData) {
          if (wrapper) {
            this.formPart.updatePeriodoPago(wrapper);
          } else {
            this.formPart.addPeriodoPago(modalData.proyectoSocioPeriodoPago);
          }
        }
      }
    );
  }

  deleteProyectoEquipo(wrapper: StatusWrapper<IProyectoSocioPeriodoPago>): void {
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
