import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { ISolicitudProyectoPeriodoJustificacion } from '@core/models/csp/solicitud-proyecto-periodo-justificacion';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { SolicitudProyectoPeriodoJustificacionesModalComponent, SolicitudProyectoPeriodoJustificacionesModalData } from '../../modals/solicitud-proyecto-periodo-justificaciones-modal/solicitud-proyecto-periodo-justificaciones-modal.component';
import { SolicitudProyectoSocioActionService } from '../../solicitud-proyecto-socio.action.service';
import { SolicitudProyectoPeriodoJustificacionesFragment } from './solicitud-proyecto-periodo-justificaciones.fragment';

const MSG_DELETE = marker('csp.solicitud-proyecto-socio.periodo-justificacion.borrar');

@Component({
  selector: 'sgi-solicitud-proyecto-periodo-justificaciones',
  templateUrl: './solicitud-proyecto-periodo-justificaciones.component.html',
  styleUrls: ['./solicitud-proyecto-periodo-justificaciones.component.scss']
})
export class SolicitudProyectoPeriodoJustificacionesComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: SolicitudProyectoPeriodoJustificacionesFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['numPeriodo', 'mesInicial', 'mesFinal', 'fechaInicio', 'fechaFin', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudProyectoPeriodoJustificacion>>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: SolicitudProyectoSocioActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.PERIODOS_JUSTIFICACION, actionService);
    this.formPart = this.fragment as SolicitudProyectoPeriodoJustificacionesFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subcription = this.formPart.periodoJustificaciones$.subscribe(
      (proyectoEquipos) => {
        this.dataSource.data = proyectoEquipos;
      }
    );
    this.subscriptions.push(subcription);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (wrapper, property) => {
      switch (property) {
        case 'fechaInicio':
          return wrapper.value.fechaInicio;
        case 'fechaFin':
          return wrapper.value.fechaFin;
        default:
          return wrapper.value[property];
      }
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(wrapper?: StatusWrapper<ISolicitudProyectoPeriodoJustificacion>): void {
    const periodoJustificacion: ISolicitudProyectoPeriodoJustificacion = {
      fechaFin: undefined,
      fechaInicio: undefined,
      id: undefined,
      mesFinal: undefined,
      mesInicial: undefined,
      numPeriodo: this.dataSource.data.length + 1,
      observaciones: undefined,
      solicitudProyectoSocio: this.actionService.getSolicitudProyectoSocio()
    };
    const data: SolicitudProyectoPeriodoJustificacionesModalData = {
      periodoJustificacion: wrapper ? wrapper.value : periodoJustificacion,
      selectedPeriodoJustificaciones: this.dataSource.data.map(element => element.value),
      mesInicioSolicitudProyectoSocio: this.actionService.getSolicitudProyectoSocio().mesInicio,
      mesFinSolicitudProyectoSocio: this.actionService.getSolicitudProyectoSocio().mesFin,
      isEdit: Boolean(wrapper),
      readonly: this.formPart.readonly
    };

    if (wrapper) {
      const index = data.selectedPeriodoJustificaciones.findIndex((element) => element === wrapper.value);
      if (index >= 0) {
        data.selectedPeriodoJustificaciones.splice(index, 1);
      }
    }

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(SolicitudProyectoPeriodoJustificacionesModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (modalData: SolicitudProyectoPeriodoJustificacionesModalData) => {
        if (modalData) {
          if (wrapper) {
            this.formPart.updatePeriodoJustificacion(wrapper);
          } else {
            this.formPart.addPeriodoJustificacion(modalData.periodoJustificacion);
          }
        }
      }
    );
  }

  deletePeriodoJustificacion(wrapper: StatusWrapper<ISolicitudProyectoPeriodoJustificacion>): void {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deletePeriodoJustificacion(wrapper);
          }
        }
      )
    );
  }
}
