import { Component, OnDestroy, OnInit } from '@angular/core';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { Subscription, BehaviorSubject, Observable, of } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { MatDialog } from '@angular/material/dialog';
import { ConvocatoriaReunionAsignacionMemoriasModalComponent } from '../convocatoria-reunion-asignacion-memorias-modal/convocatoria-reunion-asignacion-memorias-modal.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { FragmentComponent } from '@core/component/fragment.component';
import { ConvocatoriaReunionActionService } from '../../../convocatoria-reunion.action.service';
import { ConvocatoriaReunionAsignacionMemoriasListadoFragment } from './convocatoria-reunion-asignacion-memorias-listado.fragment';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const MSG_ERROR_ELIMINAR = marker('eti.convocatoriaReunion.formulario.asignacionMemorias.eliminar.imposible');

@Component({
  selector: 'sgi-convocatoria-reunion-asignacion-memorias-listado',
  templateUrl: './convocatoria-reunion-asignacion-memorias-listado.component.html',
  styleUrls: ['./convocatoria-reunion-asignacion-memorias-listado.component.scss']
})
export class ConvocatoriaReunionAsignacionMemoriasListadoComponent extends FragmentComponent implements OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  datasource: MatTableDataSource<StatusWrapper<IEvaluacion>> = new MatTableDataSource<StatusWrapper<IEvaluacion>>();
  evaluaciones$: BehaviorSubject<StatusWrapper<IEvaluacion>[]> = new BehaviorSubject<StatusWrapper<IEvaluacion>[]>([]);

  private listadoFragment: ConvocatoriaReunionAsignacionMemoriasListadoFragment;
  disableAsignarMemorias: boolean;
  private subscriptions: Subscription[] = [];

  constructor(
    protected readonly logger: NGXLogger,
    private readonly matDialog: MatDialog,
    protected readonly evaluacionService: EvaluacionService,
    protected readonly dialogService: DialogService,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected readonly snackBarService: SnackBarService,
    private actionService: ConvocatoriaReunionActionService
  ) {
    super(actionService.FRAGMENT.ASIGNACION_MEMORIAS, actionService);
    this.listadoFragment = this.fragment as ConvocatoriaReunionAsignacionMemoriasListadoFragment;
    this.evaluaciones$ = (this.fragment as ConvocatoriaReunionAsignacionMemoriasListadoFragment).evaluaciones$;

    this.displayedColumns = ['referencia', 'version', 'dictamen.nombre', 'acciones'];
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.evaluaciones$.subscribe((evaluaciones) => {
      this.datasource.data = evaluaciones;
    });

    this.subscriptions.push(this.actionService.disableAsignarMemorias.subscribe(
      (value: boolean) => {
        this.disableAsignarMemorias = value;
      }
    ));
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'ngOnInit()', 'start');
  }


  ngOnDestroy() {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Abre una ventana modal para añadir una nueva asignación de memoria al listado de memorias de una evaluación.
   *
   * Esta ventana solo se debería abrir si tenemos idConvocatoriaReunion (estamos modificando) o cuando estamos
   * creando una nueva ConvocatoriaReunion y ya tenemos establecidos los valores necesarios para obtener las memorias
   * asignables (Comité, Tipo Convocatoria y Fecha Límite)
   *
   */
  openDialogAsignarMemoria(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'openDialogAsignarMemoria()', 'start');

    const evaluacion: IEvaluacion = {
      activo: true,
      comite: null,
      convocatoriaReunion: null,
      dictamen: null,
      esRevMinima: null,
      evaluador1: null,
      evaluador2: null,
      fechaDictamen: null,
      id: null,
      memoria: null,
      tipoEvaluacion: null,
      version: null,
      eliminable: true
    };

    const config = {
      width: GLOBAL_CONSTANTS.maxWidthModal,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      ...this.matDialog,
      data: {
        params: {
          idConvocatoria: this.listadoFragment.getKey() as number,
          filterMemoriasAsignables: this.actionService.getDatosAsignacion(),
          memoriasAsignadas: this.listadoFragment.evaluaciones$.value.map(evc => evc.value.memoria),
          evaluacion
        }
      },
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(ConvocatoriaReunionAsignacionMemoriasModalComponent, config);

    this.subscriptions.push(
      dialogRef.afterClosed().subscribe(
        (evaluacionAniadida: IEvaluacion) => {
          if (evaluacionAniadida) {
            this.listadoFragment.addEvaluacion(evaluacionAniadida);
          }
        }
      ));

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'openDialogAsignarMemoria()', 'end');

  }


  /**
   * Elimina la evaluación.
   * @param evaluacionId id de la evaluacion a eliminar.
   * @param event evento lanzado.
   */
  borrar(wrappedEvaluacion: StatusWrapper<IEvaluacion>): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name,
      'borrar(convocatoriaReunionId: number, $event: Event) - start');

    const dialogSubscription = this.dialogService.showConfirmation(
      'eti.convocatoriaReunion.listado.eliminar'
    ).subscribe((aceptado) => {
      if (aceptado) {
        this.listadoFragment.deleteEvaluacion(wrappedEvaluacion);
      }
    });

    this.subscriptions.push(dialogSubscription);

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name,
      'borrar(convocatoriaReunionId: number, $event: Event) - end');
  }

  /**
   * Abre la ventana modal para modificar una evaluación
   *
   * @param evaluacion evaluación a modificar
   */
  openUpdateModal(evaluacion: StatusWrapper<IEvaluacion>): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'openUpdateModal()', 'start');
    const config = {
      width: GLOBAL_CONSTANTS.maxWidthModal,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      ...this.matDialog,
      data: {
        params: {
          idConvocatoria: this.listadoFragment.getKey() as number,
          filterMemoriasAsignables: this.actionService.getDatosAsignacion(),
          memoriasAsignadas: this.listadoFragment.evaluaciones$.value.map(evc => evc.value.memoria),
          evaluacion: evaluacion.value
        }
      },
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(ConvocatoriaReunionAsignacionMemoriasModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (resultado: IEvaluacion) => {
        if (resultado) {
          evaluacion.setEdited();
          this.fragment.setChanges(true);
          this.fragment.setComplete(true);
        }
        this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoComponent.name, 'openUpdateModal()', 'end');
      }
    );
  }

}
