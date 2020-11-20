import { Component, OnInit } from '@angular/core';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';
import { ITarea } from '@core/models/eti/tarea';
import { MatDialog } from '@angular/material/dialog';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { FragmentComponent } from '@core/component/fragment.component';
import { StatusWrapper, Status } from '@core/utils/status-wrapper';
import { SnackBarService } from '@core/services/snack-bar.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MatTableDataSource } from '@angular/material/table';
import { IConflictoInteres } from '@core/models/eti/conflicto-interes';
import { EvaluadorConflictosInteresFragment } from './evaluador-conflictos-interes-listado.fragment';
import { EvaluadorConflictosInteresModalComponent } from '../evaluador-conflictos-interes-modal/evaluador-conflictos-interes-modal.component';
import { EvaluadorActionService } from '../../../evaluador.action.service';
import { DialogService } from '@core/services/dialog.service';

const MSG_CONFIRM_DELETE = marker('eti.evaluador.conflictoInteres.formulario.listado.eliminar');

@Component({
  selector: 'sgi-evaluador-conflictos-interes',
  templateUrl: './evaluador-conflictos-interes-listado.component.html',
  styleUrls: ['./evaluador-conflictos-interes-listado.component.scss']
})
export class EvaluadorConflictosInteresListadoComponent extends FragmentComponent implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  private listadoFragment: EvaluadorConflictosInteresFragment;

  datasource: MatTableDataSource<StatusWrapper<IConflictoInteres>> = new MatTableDataSource<StatusWrapper<IConflictoInteres>>();

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly dialogService: DialogService,
    protected readonly convocatoriaReunionService: ConvocatoriaReunionService,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected matDialog: MatDialog,
    protected readonly snackBarService: SnackBarService,
    actionService: EvaluadorActionService
  ) {
    super(actionService.FRAGMENT.CONFLICTO_INTERES, actionService);
    this.listadoFragment = this.fragment as EvaluadorConflictosInteresFragment;

    this.displayedColumns = ['identificadorNumero', 'nombre', 'acciones'];

  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(EvaluadorConflictosInteresListadoComponent.name, 'ngOnInit() - start');

    this.listadoFragment.conflictos$.subscribe((conflictoInteres) => {
      this.datasource.data = conflictoInteres;
    });

    this.logger.debug(EvaluadorConflictosInteresListadoComponent.name, 'ngOnInit() - end');
  }

  /**
   * Abre la ventana modal para añadir un nuevo conflicto de interés
   */
  openModalAddConflicto(): void {
    this.logger.debug(EvaluadorConflictosInteresListadoComponent.name, 'openModalAddTarea() - start');

    const conflictos: IConflictoInteres[] = this.listadoFragment.conflictos$.value.map(conflicto => conflicto.value);

    const config = {
      width: GLOBAL_CONSTANTS.minWidthModal,
      maxHeight: GLOBAL_CONSTANTS.minHeightModal,
      data: conflictos
    };

    const dialogRef = this.matDialog.open(EvaluadorConflictosInteresModalComponent, config);

    dialogRef.afterClosed().subscribe(
      (conflictoAniadido: IConflictoInteres) => {
        if (conflictoAniadido) {
          this.listadoFragment.addConflicto(conflictoAniadido);
          this.logger.debug(EvaluadorConflictosInteresListadoComponent.name, 'openModalAddEquipoTrabajo() - end');
        }
      });

  }

  /** Elimina el conflicto de interés
   *
   * @param wrappedConflictoInteres el conflicto de interes a eliminar
   */
  delete(wrappedConflictoInteres: StatusWrapper<IConflictoInteres>): void {
    this.logger.debug(EvaluadorConflictosInteresListadoComponent.name,
      'delete(wrappedConflictoInteres: Status<IConflictoInteres>)() - start');
    const dialogSubscription = this.dialogService.showConfirmation(MSG_CONFIRM_DELETE
    ).subscribe((aceptado) => {
      if (aceptado) {
        this.listadoFragment.deleteConflictoInteres(wrappedConflictoInteres);
      }
    });
    this.logger.debug(EvaluadorConflictosInteresListadoComponent.name,
      'delete(wrappedConflictoInteres: Status<IConflictoInteres>)() - end');
  }
}
