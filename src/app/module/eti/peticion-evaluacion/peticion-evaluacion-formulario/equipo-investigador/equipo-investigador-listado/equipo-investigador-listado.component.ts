import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { EquipoTrabajoService } from '@core/services/eti/equipo-trabajo.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiAuthService } from '@sgi/framework/auth';
import { Subscription } from 'rxjs';
import { PeticionEvaluacionActionService } from '../../../peticion-evaluacion.action.service';
import {
  EquipoInvestigadorCrearModalComponent
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

  private subscriptions: Subscription[] = [];
  private listadoFragment: EquipoInvestigadorListadoFragment;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  elementosPagina: number[] = [5, 10, 25, 100];

  constructor(
    protected matDialog: MatDialog,
    protected readonly dialogService: DialogService,
    protected readonly equipoTrabajoService: EquipoTrabajoService,
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
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    this.listadoFragment.equiposTrabajo$.subscribe((equiposTrabajo) => {
      this.datasource.data = equiposTrabajo;
    });
    this.datasource.sortingDataAccessor =
      (wrapper: StatusWrapper<IEquipoTrabajo>, property: string) => {
        switch (property) {
          case 'numDocumento':
            return wrapper.value?.identificadorNumero + wrapper.value?.identificadorLetra;
          case 'nombreCompleto':
            return wrapper.value?.nombre + ' ' + wrapper.value?.primerApellido + ' ' + wrapper.value?.segundoApellido;
          default:
            return wrapper.value[property];
        }
      };
  }

  /**
   * Abre la ventana modal para añadir una persona al equipo de trabajo
   */
  openModalAddEquipoTrabajo(): void {
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
            return;
          }

          this.listadoFragment.addEquipoTrabajo(equipoTrabajoAniadido);
        }
      });

  }

  /**
   * Elimina la persona del equipo de trabajo.
   *
   * @param wrappedEquipoTrabajo equipo de trabajo a eliminar.
   */
  delete(wrappedEquipoTrabajo: StatusWrapper<IEquipoTrabajo>): void {
    const dialogSubscription = this.dialogService.showConfirmation(
      MSG_CONFIRM_DELETE
    ).subscribe((aceptado) => {
      if (aceptado) {
        this.listadoFragment.deleteEquipoTrabajo(wrappedEquipoTrabajo);
        this.actionService.eliminarTareasEquipoTrabajo(wrappedEquipoTrabajo);
      }
    });

    this.subscriptions.push(dialogSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach(x => x.unsubscribe());
  }

}
