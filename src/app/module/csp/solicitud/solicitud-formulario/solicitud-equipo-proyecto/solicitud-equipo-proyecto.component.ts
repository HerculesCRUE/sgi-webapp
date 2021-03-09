import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { ISolicitudProyectoEquipo } from '@core/models/csp/solicitud-proyecto-equipo';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { EquipoProyectoModalData, SolicitudEquipoProyectoModalComponent } from '../../modals/solicitud-equipo-proyecto-modal/solicitud-equipo-proyecto-modal.component';
import { SolicitudActionService } from '../../solicitud.action.service';
import { SolicitudEquipoProyectoFragment } from './solicitud-equipo-proyecto.fragment';

const MSG_DELETE = marker('csp.solicitud.equipo.proyecto.borrar');

@Component({
  selector: 'sgi-solicitud-equipo-proyecto',
  templateUrl: './solicitud-equipo-proyecto.component.html',
  styleUrls: ['./solicitud-equipo-proyecto.component.scss']
})
export class SolicitudEquipoProyectoComponent extends FragmentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  formPart: SolicitudEquipoProyectoFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['persona', 'nombre', 'apellidos', 'rolProyecto', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudProyectoEquipo>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: SolicitudActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.EQUIPO_PROYECTO, actionService);
    this.formPart = this.fragment as SolicitudEquipoProyectoFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.actionService.existsDatosProyectos();
    this.formPart.solicitantePersonaRef = this.actionService.getSolicitantePersonaRef();
    const subcription = this.formPart.proyectoEquipos$.subscribe(
      (proyectoEquipos) => {
        if (proyectoEquipos.length === 0 || this.formPart.getIndexSolicitante(proyectoEquipos) >= 0) {
          this.formPart.setErrors(false);
        } else {
          this.formPart.setErrors(true);
        }
        this.dataSource.data = proyectoEquipos;
      }
    );
    this.subscriptions.push(subcription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(wrapper?: StatusWrapper<ISolicitudProyectoEquipo>, position?: number): void {
    const persona: IPersona = {
      identificadorLetra: '',
      identificadorNumero: '',
      nivelAcademico: '',
      nombre: '',
      personaRef: '',
      primerApellido: '',
      segundoApellido: '',
      vinculacion: ''
    };
    const solicitudProyectoEquipo: ISolicitudProyectoEquipo = {
      id: undefined,
      mesFin: undefined,
      mesInicio: undefined,
      persona: null,
      rolProyecto: undefined,
      solicitudProyectoDatos: undefined
    };
    const data: EquipoProyectoModalData = {
      solicitudProyectoEquipo: wrapper ? wrapper.value : solicitudProyectoEquipo,
      selectedProyectoEquipos: this.dataSource.data.map(element => element.value),
      isEdit: Boolean(wrapper),
      readonly: this.formPart.readonly
    };

    if (wrapper) {
      const filtered = Object.assign([], data.selectedProyectoEquipos);
      filtered.splice(position, 1);
      data.selectedProyectoEquipos = filtered;
    }

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(SolicitudEquipoProyectoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (modalData: EquipoProyectoModalData) => {
        if (modalData) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addProyectoEquipo(modalData.solicitudProyectoEquipo);
          }
        }
      }
    );
  }

  deleteProyectoEquipo(wrapper: StatusWrapper<ISolicitudProyectoEquipo>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteProyectoEquipo(wrapper);
          }
        }
      )
    );
  }
}
