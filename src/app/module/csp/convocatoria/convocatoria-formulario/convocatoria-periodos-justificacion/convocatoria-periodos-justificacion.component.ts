import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NGXLogger } from 'ngx-logger';
import { FragmentComponent } from '@core/component/fragment.component';
import { ConvocatoriaPeriodosJustificacionFragment } from './convocatoria-periodo-justificacion.fragment';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IConvocatoriaPeriodoJustificacion } from '@core/models/csp/convocatoria-periodo-justificacion';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaPeriodosJustificacionModalComponent, IConvocatoriaPeriodoJustificacionModalData } from '../../modals/convocatoria-periodos-justificacion-modal/convocatoria-periodos-justificacion-modal.component';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@core/services/dialog.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const MSG_DELETE = marker('csp.convocatoria.periodoJustificacion.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-periodos-justificacion',
  templateUrl: './convocatoria-periodos-justificacion.component.html',
  styleUrls: ['./convocatoria-periodos-justificacion.component.scss']
})
export class ConvocatoriaPeriodosJustificacionComponent extends FragmentComponent implements OnInit, OnDestroy {

  private formPart: ConvocatoriaPeriodosJustificacionFragment;
  private subscriptions: Subscription[];

  totalElementos: number;
  displayedColumns: string[];
  elementosPagina: number[];

  dataSource: MatTableDataSource<StatusWrapper<IConvocatoriaPeriodoJustificacion>>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly dialogService: DialogService,
    protected readonly actionService: ConvocatoriaActionService,
    private matDialog: MatDialog
  ) {
    super(actionService.FRAGMENT.PERIODO_JUSTIFICACION, actionService);
    this.logger.debug(ConvocatoriaPeriodosJustificacionComponent.name, 'constructor()', 'start');

    this.formPart = this.fragment as ConvocatoriaPeriodosJustificacionFragment;
    this.elementosPagina = [5, 10, 25, 100];
    this.displayedColumns = ['numPeriodo', 'mesInicial', 'mesFinal', 'fechaInicio', 'fechaFin', 'observaciones', 'acciones'];
    this.logger.debug(ConvocatoriaPeriodosJustificacionComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaPeriodosJustificacionComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.totalElementos = 0;
    this.subscriptions = [];
    this.dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaPeriodoJustificacion>>();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaPeriodoJustificacion>, property: string) => {
        switch (property) {
          case 'fechaInicio':
            return wrapper.value.fechaInicioPresentacion ? new Date(wrapper.value.fechaInicioPresentacion).getTime() : 0;
          case 'fechaFin':
            return wrapper.value.fechaFinPresentacion ? new Date(wrapper.value.fechaFinPresentacion).getTime() : 0;
          default:
            return wrapper.value[property];
        }
      };
    this.sort.sort(({ id: 'numPeriodo', start: 'asc' }) as MatSortable);
    this.dataSource.sort = this.sort;

    this.subscriptions.push(this.formPart.periodosJustificacion$.subscribe(elements => {
      this.dataSource.data = elements;
      this.logger.debug(ConvocatoriaPeriodosJustificacionComponent.name, 'ngOnInit()', 'end');
    }));
  }


  /**
   * Apertura de modal de periodos justificacion (edición/creación)
   *
   * @param periodoJustificacionActualizar Periodo justificacion que se carga en el modal para modificarlo.
   */
  openModalPeriodoJustificacion(periodoJustificacionActualizar?: StatusWrapper<IConvocatoriaPeriodoJustificacion>): void {
    this.logger.debug(ConvocatoriaPeriodosJustificacionComponent.name,
      `${this.openModalPeriodoJustificacion.name}(${periodoJustificacionActualizar})`, 'start');

    const modalData = {
      duracion: this.actionService.duracion,
      convocatoriaPeriodoJustificacion: periodoJustificacionActualizar
        ? periodoJustificacionActualizar.value : {} as IConvocatoriaPeriodoJustificacion,
      convocatoriaPeriodoJustificacionList: this.dataSource.data
    } as IConvocatoriaPeriodoJustificacionModalData;

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: modalData,
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(ConvocatoriaPeriodosJustificacionModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (periodoJustificacionModal: IConvocatoriaPeriodoJustificacion) => {
        if (!periodoJustificacionModal) {
          this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name,
            `${this.openModalPeriodoJustificacion.name}(${periodoJustificacionActualizar})`, 'end');
          return;
        }

        if (!periodoJustificacionActualizar) {
          this.formPart.addPeriodoJustificacion(periodoJustificacionModal);
        } else if (!periodoJustificacionActualizar.created) {
          periodoJustificacionActualizar.setEdited();
          this.formPart.setChanges(true);
        }

        this.recalcularNumPeriodos();

        this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name,
          `${this.openModalPeriodoJustificacion.name}(${periodoJustificacionActualizar})`, 'end');
      }
    );

  }

  /**
   * Muestra la confirmacion para eliminar un periodo justificacion
   *
   * @param periodoJustificacion Periodo justificacion que se quiere eliminar
   */
  deletePeriodoJustificacion(periodoJustificacion?: StatusWrapper<IConvocatoriaPeriodoJustificacion>): void {
    this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name,
      `${this.deletePeriodoJustificacion.name}(${periodoJustificacion})`, 'start');

    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deletePeriodoJustificacion(periodoJustificacion);
            this.recalcularNumPeriodos();
          }

          this.logger.debug(ConvocatoriaPeriodosJustificacionModalComponent.name,
            `${this.deletePeriodoJustificacion.name}(${periodoJustificacion})`, 'end');
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaPeriodosJustificacionComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaPeriodosJustificacionComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Recalcula los numeros de los periodos de todos los periodos de justificacion de la tabla en funcion de su mes inicial.
   */
  private recalcularNumPeriodos(): void {
    let numPeriodo = 1;
    this.dataSource.data
      .sort((a, b) => (a.value.mesInicial > b.value.mesInicial) ? 1 : ((b.value.mesInicial > a.value.mesInicial) ? -1 : 0));

    this.dataSource.data.forEach(c => {
      c.value.numPeriodo = numPeriodo++;
    });

    this.formPart.periodosJustificacion$.next(this.dataSource.data);
  }

}
