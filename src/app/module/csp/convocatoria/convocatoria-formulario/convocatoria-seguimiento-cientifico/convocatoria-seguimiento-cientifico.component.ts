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
  formPart: ConvocatoriaSeguimientoCientificoFragment;
  private subscriptions: Subscription[] = [];

  columnas = ['numPeriodo', 'mesInicial', 'mesFinal', 'fechaInicio', 'fechaFin', 'observaciones', 'acciones'];
  elementosPagina = [5, 10, 25, 100];

  dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaSeguimientoCientifico>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.SEGUIMIENTO_CIENTIFICO, actionService);
    this.formPart = this.fragment as ConvocatoriaSeguimientoCientificoFragment;
  }

  ngOnInit(): void {
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
    }));
  }

  /**
   * Apertura de modal de seguimiento cientifico (edición/creación)
   *
   * @param seguimientoCientificoActualizar seguimiento cientifico que se carga en el modal para modificarlo.
   */
  openModalSeguimientoCientifico(seguimientoCientificoActualizar?: StatusWrapper<IConvocatoriaSeguimientoCientifico>): void {
    const modalData: IConvocatoriaSeguimientoCientificoModalData = {
      duracion: this.actionService.duracion,
      convocatoriaSeguimientoCientifico: seguimientoCientificoActualizar
        ? seguimientoCientificoActualizar.value : {} as IConvocatoriaSeguimientoCientifico,
      convocatoriaSeguimientoCientificoList: this.dataSource.data,
      readonly: this.formPart.readonly
    };

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: modalData,
    };

    const dialogRef = this.matDialog.open(ConvocatoriaSeguimientoCientificoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (periodoJustificacionModal: IConvocatoriaSeguimientoCientifico) => {
        if (!periodoJustificacionModal) {
          return;
        }

        if (!seguimientoCientificoActualizar) {
          this.formPart.addSeguimientoCientifico(periodoJustificacionModal);
        } else if (!seguimientoCientificoActualizar.created) {
          seguimientoCientificoActualizar.setEdited();
          this.formPart.setChanges(true);
        }

        this.recalcularNumPeriodos();
      }
    );

  }

  /**
   * Muestra la confirmacion para eliminar seguimiento cientifico
   *
   * @param seguimientoCientifico seguimiento cientifico que se quiere eliminar
   */
  deleteSeguimientoCientifico(seguimientoCientifico?: StatusWrapper<IConvocatoriaSeguimientoCientifico>): void {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteSeguimientoCientifico(seguimientoCientifico);
            this.recalcularNumPeriodos();
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
