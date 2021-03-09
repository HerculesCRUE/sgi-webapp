import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { ISolicitudProyectoEquipoSocio } from '@core/models/csp/solicitud-proyecto-equipo-socio';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { SolicitudProyectoEquipoSocioModalData, SolicitudProyectoSocioEquipoSocioModalComponent } from '../../modals/solicitud-proyecto-socio-equipo-socio-modal/solicitud-proyecto-socio-equipo-socio-modal.component';
import { SolicitudProyectoSocioActionService } from '../../solicitud-proyecto-socio.action.service';
import { SolicitudProyectoSocioEquipoSocioFragment } from './solicitud-proyecto-socio-equipo-socio.fragment';

const MSG_DELETE = marker('csp.solicitud.proyecto.socio.equipo.borrar');

@Component({
  selector: 'sgi-solicitud-proyecto-socio-equipo-socio',
  templateUrl: './solicitud-proyecto-socio-equipo-socio.component.html',
  styleUrls: ['./solicitud-proyecto-socio-equipo-socio.component.scss']
})
export class SolicitudProyectoSocioEquipoSocioComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: SolicitudProyectoSocioEquipoSocioFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['persona', 'nombre', 'apellidos', 'rolProyecto', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudProyectoEquipoSocio>>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: SolicitudProyectoSocioActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.EQUIPO_SOCIO, actionService);
    this.formPart = this.fragment as SolicitudProyectoSocioEquipoSocioFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subcription = this.formPart.proyectoEquipoSocios$.subscribe(
      (proyectoEquipos) => {
        this.dataSource.data = proyectoEquipos;
      }
    );
    this.subscriptions.push(subcription);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (wrapper, property) => {
      switch (property) {
        case 'persona':
          return wrapper.value.persona.personaRef;
        case 'nombre':
          return wrapper.value.persona.nombre;
        case 'apellidos':
          const persona = wrapper.value.persona;
          return `${persona.primerApellido} ${persona.segundoApellido}`;
        case 'rolProyecto':
          return wrapper.value.rolProyecto.nombre;
        default:
          return wrapper.value[property];
      }
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(wrapper?: StatusWrapper<ISolicitudProyectoEquipoSocio>): void {
    const solicitudProyectoEquipo: ISolicitudProyectoEquipoSocio = {
      id: undefined,
      mesFin: undefined,
      mesInicio: undefined,
      persona: null,
      rolProyecto: undefined,
      solicitudProyectoSocio: undefined
    };
    const data: SolicitudProyectoEquipoSocioModalData = {
      solicitudProyectoEquipoSocio: wrapper ? wrapper.value : solicitudProyectoEquipo,
      selectedProyectoEquipoSocios: this.dataSource.data.map(element => element.value),
      mesInicioSolicitudProyectoSocio: this.actionService.getSolicitudProyectoSocio().mesInicio,
      mesFinSolicitudProyectoSocio: this.actionService.getSolicitudProyectoSocio().mesFin,
      isEdit: Boolean(wrapper),
      readonly: this.formPart.readonly
    };

    if (wrapper) {
      const index = data.selectedProyectoEquipoSocios.findIndex((element) => element === wrapper.value);
      if (index >= 0) {
        data.selectedProyectoEquipoSocios.splice(index, 1);
      }
    }

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(SolicitudProyectoSocioEquipoSocioModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (modalData: SolicitudProyectoEquipoSocioModalData) => {
        if (modalData) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addProyectoEquipoSocio(modalData.solicitudProyectoEquipoSocio);
          }
        }
      }
    );
  }

  deleteProyectoEquipo(wrapper: StatusWrapper<ISolicitudProyectoEquipoSocio>): void {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteProyectoEquipoSocio(wrapper);
          }
        }
      )
    );
  }
}
