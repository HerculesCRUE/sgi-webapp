import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaSeguimientoCientifico } from '@core/models/csp/convocatoria-seguimiento-cientifico';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaSeguimientoCientificoModalComponent, IConvocatoriaSeguimientoCientificoModalData } from '../../modals/convocatoria-seguimiento-cientifico-modal/convocatoria-seguimiento-cientifico-modal.component';
import { ConvocatoriaSeguimientoCientificoFragment } from './convocatoria-seguimiento-cientifico.fragment';

const MSG_DELETE = marker('csp.convocatoria.seguimiento.cientifico.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-seguimiento-cientifico',
  templateUrl: './convocatoria-seguimiento-cientifico.component.html',
  styleUrls: ['./convocatoria-seguimiento-cientifico.component.scss']
})
export class ConvocatoriaSeguimientoCientificoComponent extends FragmentComponent implements OnInit, OnDestroy {

  private formPart: ConvocatoriaSeguimientoCientificoFragment;
  private subscriptions: Subscription[] = [];

  columnas: string[] = ['numPeriodo', 'mesInicial', 'mesFinal', 'fechaInicio', 'fechaFin', 'observaciones', 'acciones'];
  elementosPagina: number[] = [5, 10, 25, 100];

  dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaSeguimientoCientifico>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.SEGUIMIENTO_CIENTIFICO, actionService);
    this.logger.debug(ConvocatoriaSeguimientoCientificoComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaSeguimientoCientificoFragment;
    this.logger.debug(ConvocatoriaSeguimientoCientificoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaSeguimientoCientificoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaSeguimientoCientifico>, property: string) => {
        switch (property) {
          case 'numPeriodo':
            return wrapper.value.numPeriodo;
          case 'mesInicial':
            return wrapper.value.mesInicial;
          case 'mesFinal':
            return wrapper.value.mesFinal;
          case 'fechaInicio':
            return wrapper.value.fechaInicioPresentacion;
          case 'fechaFin':
            return wrapper.value.fechaFinPresentacion;
          default:
            return wrapper[property];
        }
      };
    this.sort.sort(({ id: 'numPeriodo', start: 'asc' }) as MatSortable);
    this.dataSource.sort = this.sort;
    this.subscriptions.push(this.formPart.seguimientosCientificos$.subscribe(elements => {
      this.dataSource.data = elements;
      this.logger.debug(ConvocatoriaSeguimientoCientificoComponent.name, 'ngOnInit()', 'end');
    }));
  }

  /**
   * Apertura de modal de seguimiento cientifico (edición/creación)
   *
   * @param seguimientoCientificoActualizar seguimiento cientifico que se carga en el modal para modificarlo.
   */
  openModalSeguimientoCientifico(seguimientoCientificoActualizar?: StatusWrapper<IConvocatoriaSeguimientoCientifico>): void {
    this.logger.debug(ConvocatoriaSeguimientoCientificoComponent.name,
      `${this.openModalSeguimientoCientifico.name}(${seguimientoCientificoActualizar})`, 'start');

    const modalData: IConvocatoriaSeguimientoCientificoModalData = {
      duracion: this.actionService.duracion,
      convocatoriaSeguimientoCientifico: seguimientoCientificoActualizar
        ? seguimientoCientificoActualizar.value : {} as IConvocatoriaSeguimientoCientifico,
      convocatoriaSeguimientoCientificoList: this.dataSource.data
    };

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: modalData,
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(ConvocatoriaSeguimientoCientificoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (periodoJustificacionModal: IConvocatoriaSeguimientoCientifico) => {
        if (!periodoJustificacionModal) {
          this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name,
            `${this.openModalSeguimientoCientifico.name}(${seguimientoCientificoActualizar})`, 'end');
          return;
        }

        if (!seguimientoCientificoActualizar) {
          this.formPart.addSeguimientoCientifico(periodoJustificacionModal);
        } else if (!seguimientoCientificoActualizar.created) {
          seguimientoCientificoActualizar.setEdited();
          this.formPart.setChanges(true);
        }

        this.recalcularNumPeriodos();

        this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name,
          `${this.openModalSeguimientoCientifico.name}(${seguimientoCientificoActualizar})`, 'end');
      }
    );

  }

  /**
   * Muestra la confirmacion para eliminar seguimiento cientifico
   *
   * @param seguimientoCientifico seguimiento cientifico que se quiere eliminar
   */
  deleteSeguimientoCientifico(seguimientoCientifico?: StatusWrapper<IConvocatoriaSeguimientoCientifico>): void {
    this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name,
      `${this.deleteSeguimientoCientifico.name}(${seguimientoCientifico})`, 'start');

    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteSeguimientoCientifico(seguimientoCientifico);
            this.recalcularNumPeriodos();
          }

          this.logger.debug(ConvocatoriaSeguimientoCientificoModalComponent.name,
            `${this.deleteSeguimientoCientifico.name}(${seguimientoCientifico})`, 'end');
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaSeguimientoCientificoComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaSeguimientoCientificoComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Recalcula los numeros de los periodos de todos los periodos de justificacion de la tabla en funcion de su mes inicial.
   */
  private recalcularNumPeriodos(): void {
    let numPeriodo = 1;
    this.dataSource.data
      .sort((a, b) => (a.value.mesInicial > b.value.mesInicial) ? 1 : ((b.value.mesInicial > a.value.mesInicial) ? -1 : 0));

    this.dataSource.data.map(c => {
      c.value.numPeriodo = numPeriodo++;
    });

    this.formPart.seguimientosCientificos$.next(this.dataSource.data);
  }

}
