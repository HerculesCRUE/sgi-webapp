import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Observable, of, Subscription, zip, BehaviorSubject } from 'rxjs';
import { map, switchMap, catchError, filter, tap } from 'rxjs/operators';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { IPersona } from '@core/models/sgp/persona';
import { FormGroup } from '@angular/forms';
import { DialogService } from '@core/services/dialog.service';
import { EquipoTrabajoService } from '@core/services/eti/equipo-trabajo.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiAuthService } from '@sgi/framework/auth';

import { PeticionEvaluacionActionService } from '../../../peticion-evaluacion.action.service';
import {
  EquipoInvestigadorCrearModalComponent,
} from '../equipo-investigador-crear-modal/equipo-investigador-crear-modal.component';
import { EquipoInvestigadorListadoFragment } from './equipo-investigador-listado.fragment';

const MSG_CONFIRM_DELETE = marker('eti.peticionEvaluacion.formulario.equipoInvestigador.listado.eliminar');
const MSG_ERROR_INVESTIGADOR_REPETIDO = marker('eti.peticionEvaluacion.formulario.equipoInvestigador.listado.investigadorRepetido');

@Component({
  selector: 'sgi-equipo-investigador-listado',
  templateUrl: './equipo-investigador-listado.component.html',
  styleUrls: ['./equipo-investigador-listado.component.scss']
})
export class EquipoInvestigadorListadoComponent extends FragmentComponent implements OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  datasource: MatTableDataSource<StatusWrapper<IEquipoTrabajo>> = new MatTableDataSource<StatusWrapper<IEquipoTrabajo>>();

  personaRefUsuarioLogeado: string;

  private subscriptions: Subscription[] = [];
  private listadoFragment: EquipoInvestigadorListadoFragment;

  constructor(
    protected matDialog: MatDialog,
    protected readonly dialogService: DialogService,
    protected readonly equipoTrabajoService: EquipoTrabajoService,
    protected readonly logger: NGXLogger,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected readonly peticionEvaluacionService: PeticionEvaluacionService,
    protected readonly sgiAuthService: SgiAuthService,
    protected readonly snackBarService: SnackBarService,
    private actionService: PeticionEvaluacionActionService
  ) {
    super(actionService.FRAGMENT.EQUIPO_INVESTIGADOR, actionService);
    this.listadoFragment = this.fragment as EquipoInvestigadorListadoFragment;

    this.displayedColumns = ['numDocumento', 'nombreCompleto', 'vinculacion', 'nivelAcademico', 'acciones'];
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(EquipoInvestigadorListadoComponent.name, 'ngOnInit() - start');

    this.listadoFragment.equiposTrabajo$.subscribe((equiposTrabajo) => {
      this.datasource.data = equiposTrabajo;
    });

    this.logger.debug(EquipoInvestigadorListadoComponent.name, 'ngOnInit() - end');
  }

  /**
   * Abre la ventana modal para añadir una persona al equipo de trabajo
   */
  openModalAddEquipoTrabajo(): void {
    this.logger.debug(EquipoInvestigadorListadoComponent.name, 'openModalAddEquipoTrabajo() - start');

    const config = {
      width: GLOBAL_CONSTANTS.minWidthModal,
      maxHeight: GLOBAL_CONSTANTS.minHeightModal
    };

    const dialogRef = this.matDialog.open(EquipoInvestigadorCrearModalComponent, config);

    dialogRef.afterClosed().subscribe(
      (equipoTrabajoAniadido: IEquipoTrabajo) => {
        if (equipoTrabajoAniadido) {
          const isRepetido =
            this.listadoFragment.equiposTrabajo$.value.some(equipoTrabajoWrapper =>
              equipoTrabajoAniadido.personaRef === equipoTrabajoWrapper.value.personaRef);

          if (isRepetido) {
            this.snackBarService.showError(MSG_ERROR_INVESTIGADOR_REPETIDO);
            this.logger.debug(EquipoInvestigadorListadoComponent.name, 'openModalAddEquipoTrabajo() - end');
            return;
          }

          this.listadoFragment.addEquipoTrabajo(equipoTrabajoAniadido);

          this.logger.debug(EquipoInvestigadorListadoComponent.name, 'openModalAddEquipoTrabajo() - end');
        }
      });

  }

  /**
   * Elimina la persona del equipo de trabajo.
   *
   * @param wrappedEquipoTrabajo equipo de trabajo a eliminar.
   */
  delete(wrappedEquipoTrabajo: StatusWrapper<IEquipoTrabajo>): void {
    this.logger.debug(EquipoInvestigadorListadoComponent.name,
      'delete(wrappedEquipoTrabajo: StatusWrapper<IEquipoTrabajo>) - start');

    const dialogSubscription = this.dialogService.showConfirmation(
      MSG_CONFIRM_DELETE
    ).subscribe((aceptado) => {
      if (aceptado) {
        this.listadoFragment.deleteEquipoTrabajo(wrappedEquipoTrabajo);
        this.actionService.eliminarTareasEquipoTrabajo(wrappedEquipoTrabajo);
      }
    });

    this.subscriptions.push(dialogSubscription);

    this.logger.debug(EquipoInvestigadorListadoComponent.name,
      'delete(wrappedEquipoTrabajo: StatusWrapper<IEquipoTrabajo>) - end');
  }

  ngOnDestroy(): void {
    this.logger.debug(EquipoInvestigadorListadoComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(EquipoInvestigadorListadoComponent.name, 'ngOnDestroy()', 'end');
  }

}
