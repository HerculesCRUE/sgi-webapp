import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IProyectoSocioEquipo } from '@core/models/csp/proyecto-socio-equipo';
import { DialogService } from '@core/services/dialog.service';
import { DateUtils } from '@core/utils/date-utils';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { ProyectoEquipoSocioModalData, ProyectoSocioEquipoModalComponent } from '../../modals/proyecto-socio-equipo-modal/proyecto-socio-equipo-modal.component';
import { ProyectoSocioActionService } from '../../proyecto-socio.action.service';
import { ProyectoSocioEquipoFragment } from './proyecto-socio-equipo.fragment';

const MSG_DELETE = marker('csp.proyecto-equipo.socio-equipo.borrar');

@Component({
  selector: 'sgi-proyecto-socio-equipo',
  templateUrl: './proyecto-socio-equipo.component.html',
  styleUrls: ['./proyecto-socio-equipo.component.scss']
})
export class ProyectoSocioEquipoComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: ProyectoSocioEquipoFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['nombre', 'apellidos', 'rolProyecto', 'fechaInicio', 'fechaFin', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<IProyectoSocioEquipo>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: ProyectoSocioActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.EQUIPO, actionService);
    this.formPart = this.fragment as ProyectoSocioEquipoFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subcription = this.formPart.proyectoEquipoSocios$.subscribe(
      (proyectoEquipos) => this.dataSource.data = proyectoEquipos
    );
    this.subscriptions.push(subcription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(wrapper?: StatusWrapper<IProyectoSocioEquipo>, position?: number): void {
    const proyectoSocioEquipo: IProyectoSocioEquipo = {
      id: undefined,
      fechaFin: undefined,
      fechaInicio: undefined,
      persona: null,
      proyectoSocio: undefined,
      rolProyecto: undefined
    };
    const fechaInicioProyectoSocio = DateUtils.fechaToDate(this.actionService.getProyectoSocio()?.fechaInicio);
    const fechaFinProyectoSocio = DateUtils.fechaToDate(this.actionService.getProyectoSocio()?.fechaFin);
    const data: ProyectoEquipoSocioModalData = {
      proyectoSocioEquipo: wrapper ? wrapper.value : proyectoSocioEquipo,
      selectedProyectoSocioEquipos: this.dataSource.data.map(element => element.value),
      fechaInicioProyectoSocio,
      fechaFinProyectoSocio,
      isEdit: Boolean(wrapper)
    };

    if (wrapper) {
      const filtered = Object.assign([], data.selectedProyectoSocioEquipos);
      filtered.splice(position, 1);
      data.selectedProyectoSocioEquipos = filtered;
    }

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(ProyectoSocioEquipoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (modalData: ProyectoEquipoSocioModalData) => {
        if (modalData) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addProyectoSocioEquipo(modalData.proyectoSocioEquipo);
          }
        }
      }
    );
  }

  deleteProyectoSocioEquipo(wrapper: StatusWrapper<IProyectoSocioEquipo>): void {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteProyectoSocioEquipo(wrapper);
          }
        }
      )
    );
  }
}
