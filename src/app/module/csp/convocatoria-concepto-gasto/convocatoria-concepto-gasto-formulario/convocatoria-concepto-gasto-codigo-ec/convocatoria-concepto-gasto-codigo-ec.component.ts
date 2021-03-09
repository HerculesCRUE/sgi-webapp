import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NGXLogger } from 'ngx-logger';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { ConvocatoriaConceptoGastoActionService } from '../../convocatoria-concepto-gasto.action.service';
import { FragmentComponent } from '@core/component/fragment.component';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { ConvocatoriaConceptoGastoCodigoEcFragment } from './convocatoria-concepto-gasto-codigo-ec.fragment';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@core/services/dialog.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FormGroup } from '@angular/forms';
import { ConvocatoriaConceptoGastoCodigoEcModalComponent, IConvocatoriaConceptoGastoCodigoEcModalComponent } from '../../modals/convocatoria-concepto-gasto-codigo-ec-modal/convocatoria-concepto-gasto-codigo-ec-modal.component';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';

const MSG_DELETE = marker('csp.convocatoria.concepto-gasto.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-concepto-gasto-codigo-ec',
  templateUrl: './convocatoria-concepto-gasto-codigo-ec.component.html',
  styleUrls: ['./convocatoria-concepto-gasto-codigo-ec.component.scss']
})
export class ConvocatoriaConceptoGastoCodigoEcComponent extends FragmentComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  formPart: ConvocatoriaConceptoGastoCodigoEcFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina: number[] = [5, 10, 25, 100];
  displayedColumns: string[] = ['convocatoriaConceptoGasto.conceptoGasto.nombre', 'codigoEconomicoRef', 'fechaInicio', 'fechaFin', 'convocatoriaConceptoGasto.observaciones', 'acciones'];

  dataSource: MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>> =
    new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>>();
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild('sort', { static: true }) sort: MatSort;

  disableAddCodigoEc = true;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly actionService: ConvocatoriaConceptoGastoActionService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.CODIGOS_ECONOMICOS, actionService);
    this.formPart = this.fragment as ConvocatoriaConceptoGastoCodigoEcFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '1';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>>();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.disableAddCodigoEc = !Boolean(this.actionService.getDatosConvocatoriaConceptoGastos()?.conceptoGasto);

    this.subscriptions.push(this.formPart?.convocatoriaConceptoGastoCodigoEcs$.subscribe(elements => {
      this.dataSource.data = elements;
    }));

    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>, property: string) => {
        switch (property) {
          case 'fechaInicio':
            return wrapper.value.fechaInicio ? new Date(wrapper.value.fechaInicio).getTime() : 0;
          case 'fechaFin':
            return wrapper.value.fechaFin ? new Date(wrapper.value.fechaFin).getTime() : 0;
          default:
            return wrapper.value[property];
        }
      };
  }

  openModal(wrapper?: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>, numFila?: number): void {
    const convocatoriaConceptoGastoCodigoEcsTabla = this.dataSource.data.map(
      wrapper => wrapper.value);

    convocatoriaConceptoGastoCodigoEcsTabla.splice(numFila, 1);

    const convocatoriaConceptoGastos = this.actionService.getSelectedConvocatoriaConceptoGastos();

    const data: IConvocatoriaConceptoGastoCodigoEcModalComponent = {
      convocatoriaConceptoGastoCodigoEc: wrapper.value,
      convocatoriaConceptoGastoCodigoEcsTabla,
      convocatoriaConceptoGastos,
      editModal: true,
      readonly: this.formPart.readonly,
    };

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ConvocatoriaConceptoGastoCodigoEcModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc) => {
        if (convocatoriaConceptoGastoCodigoEc) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addConvocatoriaConceptoGastoCodigoEc(convocatoriaConceptoGastoCodigoEc);
          }
        }
      }
    );
  }

  openModalCrear(permitido: boolean): void {
    const convocatoriaConceptoGastoCodigoEcsTabla = this.dataSource.data.map(
      wrapper => wrapper.value);

    const convocatoriaConceptoGastos = this.actionService.getSelectedConvocatoriaConceptoGastos();

    const convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc = {
      convocatoriaConceptoGasto: this.formPart.convocatoriaConceptoGasto && this.formPart.convocatoriaConceptoGasto.id ? this.formPart.convocatoriaConceptoGasto : this.actionService.getDatosConvocatoriaConceptoGastos(),
      codigoEconomicoRef: null,
      fechaFin: null,
      fechaInicio: null,
      id: null,
      observaciones: undefined
    };

    const data: IConvocatoriaConceptoGastoCodigoEcModalComponent = {
      convocatoriaConceptoGastoCodigoEc,
      convocatoriaConceptoGastoCodigoEcsTabla,
      convocatoriaConceptoGastos,
      editModal: false,
      readonly: this.formPart.readonly,
    };

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ConvocatoriaConceptoGastoCodigoEcModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          this.formPart.addConvocatoriaConceptoGastoCodigoEc(result);
        }
      }
    );
  }

  deleteConvocatoriaConceptoGastoCodigoEc(wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteConvocatoriaConceptoGastoCodigoEc(wrapper);
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}

