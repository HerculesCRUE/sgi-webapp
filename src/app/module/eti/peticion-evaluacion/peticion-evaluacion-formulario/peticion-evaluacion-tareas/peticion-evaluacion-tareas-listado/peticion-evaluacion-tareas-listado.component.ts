import { Component, OnInit, OnDestroy } from '@angular/core';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ITarea } from '@core/models/eti/tarea';
import { MatDialog } from '@angular/material/dialog';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { FragmentComponent } from '@core/component/fragment.component';
import { PeticionEvaluacionActionService } from '../../../peticion-evaluacion.action.service';
import { PeticionEvaluacionTareasFragment } from './peticion-evaluacion-tareas-listado.fragment';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SnackBarService } from '@core/services/snack-bar.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { PeticionEvaluacionTareasModalComponent } from '../peticion-evaluacion-tareas-modal/peticion-evaluacion-tareas-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from '@core/services/dialog.service';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { IMemoria } from '@core/models/eti/memoria';

const MSG_CONFIRM_DELETE = marker('eti.peticionEvaluacion.tareas.listado.eliminar');
const MSG_ERROR_TAREA_REPETIDA = marker('eti.peticionEvaluacion.formulario.equipoInvestigador.listado.investigadorRepetido');

@Component({
  selector: 'sgi-peticion-evaluacion-tareas',
  templateUrl: './peticion-evaluacion-tareas-listado.component.html',
  styleUrls: ['./peticion-evaluacion-tareas-listado.component.scss']
})
export class PeticionEvaluacionTareasListadoComponent extends FragmentComponent implements OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  tareas$: BehaviorSubject<StatusWrapper<ITarea>[]>;
  private listadoFragment: PeticionEvaluacionTareasFragment;
  private subscriptions: Subscription[] = [];

  datasource: MatTableDataSource<StatusWrapper<ITarea>> = new MatTableDataSource<StatusWrapper<ITarea>>();

  constructor(
    protected readonly dialogService: DialogService,
    protected readonly logger: NGXLogger,
    protected readonly convocatoriaReunionService: ConvocatoriaReunionService,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected matDialog: MatDialog,
    protected readonly snackBarService: SnackBarService,
    actionService: PeticionEvaluacionActionService
  ) {
    super(actionService.FRAGMENT.TAREAS, actionService);
    this.tareas$ = (this.fragment as PeticionEvaluacionTareasFragment).tareas$;
    this.listadoFragment = this.fragment as PeticionEvaluacionTareasFragment;

    this.displayedColumns = ['equipoTrabajo.nombre', 'memoria.numRerecencia', 'tarea',
      'formacionEspecifica.nombre', 'organismo', 'acciones'];

  }

  ngOnInit(): void {
    super.ngOnInit();
    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'ngOnInit() - start');

    this.listadoFragment.tareas$.subscribe((tarea) => {
      this.datasource.data = tarea;
    });

    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'ngOnInit() - end');
  }

  /**
   * Abre la ventana modal para añadir una nueva tarea
   */
  openModalAddTarea(): void {
    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'openModalAddTarea() - start');


    const tarea: ITarea = {
      organismo: null,
      anio: null,
      memoria: null,
      equipoTrabajo: null,
      formacion: null,
      formacionEspecifica: null,
      tarea: null,
      tipoTarea: null,
      id: null,
      eliminable: true
    };

    const equiposTrabajo: IEquipoTrabajo[] = this.listadoFragment.equiposTrabajo;
    const memorias: IMemoria[] = this.listadoFragment.memorias;

    const config = {
      width: GLOBAL_CONSTANTS.minWidthModal,
      maxHeight: GLOBAL_CONSTANTS.minHeightModal,
      data: {
        tarea, equiposTrabajo, memorias
      },
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(PeticionEvaluacionTareasModalComponent, config);

    dialogRef.afterClosed().subscribe(
      (tareaAniadida: ITarea) => {
        if (tareaAniadida) {
          this.listadoFragment.addTarea(tareaAniadida);

          this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'openModalAddEquipoTrabajo() - end');
        }
      });

  }

  /**
   * Abre la ventana modal para modificar una tarea
   *
   * @param tarea tarea a modificar
   */
  openUpdateModal(tarea: StatusWrapper<ITarea>): void {
    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'openUpdateModal()', 'start');

    const equiposTrabajo: IEquipoTrabajo[] = this.listadoFragment.equiposTrabajo;
    const memorias: IMemoria[] = this.listadoFragment.memorias;

    const config = {
      width: GLOBAL_CONSTANTS.minWidthModal,
      maxHeight: GLOBAL_CONSTANTS.minHeightModal,
      data: {
        tarea: tarea.value, equiposTrabajo, memorias
      },
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(PeticionEvaluacionTareasModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (resultado: ITarea) => {
        if (resultado) {
          tarea.setEdited();
          this.fragment.setChanges(true);
          this.fragment.setComplete(true);
        }
        this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'openUpdateModal()', 'end');
      }
    );
  }

  /**
   * Elimina la persona del equipo de trabajo.
   *
   * @param wrappedTarea equipo de trabajo a eliminar.
   */
  delete(wrappedTarea: StatusWrapper<ITarea>): void {
    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name,
      'delete(wrappedEquipoTrabajo: StatusWrapper<IEquipoTrabajo>) - start');

    const dialogSubscription = this.dialogService.showConfirmation(
      MSG_CONFIRM_DELETE
    ).subscribe((aceptado) => {
      if (aceptado) {
        this.listadoFragment.deleteTarea(wrappedTarea);
      }
    });

    this.subscriptions.push(dialogSubscription);

    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name,
      'delete(wrappedEquipoTrabajo: StatusWrapper<IEquipoTrabajo>) - end');
  }

  ngOnDestroy(): void {
    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(PeticionEvaluacionTareasListadoComponent.name, 'ngOnDestroy()', 'end');
  }

}
