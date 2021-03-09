import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FragmentComponent } from '@core/component/fragment.component';
import { IAsistente } from '@core/models/eti/asistente';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject } from 'rxjs';
import { ActaActionService } from '../../../acta.action.service';
import { ActaAsistentesEditarModalComponent } from '../acta-asistentes-editar-modal/acta-asistentes-editar-modal.component';
import { ActaAsistentesFragment } from './acta-asistentes-listado.fragment';

@Component({
  selector: 'sgi-acta-asistentes',
  templateUrl: './acta-asistentes-listado.component.html',
  styleUrls: ['./acta-asistentes-listado.component.scss']
})
export class ActaAsistentesListadoComponent extends FragmentComponent implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  asistentes$: BehaviorSubject<StatusWrapper<IAsistente>[]>;

  readonly: boolean;

  constructor(
    protected readonly convocatoriaReunionService: ConvocatoriaReunionService,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected matDialog: MatDialog,
    private actionService: ActaActionService
  ) {
    super(actionService.FRAGMENT.ASISTENTES, actionService);
    this.asistentes$ = (this.fragment as ActaAsistentesFragment).asistentes$;

    this.displayedColumns = ['evaluador.identificadorNumero', 'evaluador.nombre', 'asistencia', 'motivo', 'acciones'];
  }

  ngOnInit() {
    super.ngOnInit();
    this.readonly = this.actionService.readonly;
  }

  /**
   * Abre la ventana modal para modificar una asistencia
   *
   * @param asistente asistente a modificar
   */
  openUpdateModal(asistente: StatusWrapper<IAsistente>): void {
    const config = {
      width: GLOBAL_CONSTANTS.minWidthModal,
      maxHeight: GLOBAL_CONSTANTS.minHeightModal,
      data: asistente.value
    };
    const dialogRef = this.matDialog.open(ActaAsistentesEditarModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (resultado: IAsistente) => {
        if (resultado) {
          asistente.setEdited();
          this.fragment.setChanges(true);
          this.fragment.setComplete(true);
        }
      }
    );
  }
}
