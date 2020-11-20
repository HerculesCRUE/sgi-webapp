import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NGXLogger } from 'ngx-logger';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
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

  private formPart: ConvocatoriaConceptoGastoCodigoEcFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina: number[] = [5, 10, 25, 100];
  displayedColumnsPermitidos: string[] = ['convocatoriaConceptoGasto.conceptoGasto.nombre', 'codigoEconomicoRef', 'fechaInicio', 'fechaFin', 'convocatoriaConceptoGasto.observaciones', 'acciones'];
  displayedColumnsNoPermitidos: string[] = ['convocatoriaConceptoGasto.conceptoGasto.nombre', 'codigoEconomicoRef', 'fechaInicio', 'fechaFin', 'convocatoriaConceptoGasto.observaciones', 'acciones'];

  dataSourcePermitidos: MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>> =
    new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>>();
  dataSourceNoPermitidos: MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>> =
    new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>>();
  @ViewChild('paginatorPermitidos', { static: true }) paginatorPermitidos: MatPaginator;
  @ViewChild('paginatorNoPermitidos', { static: true }) paginatorNoPermitidos: MatPaginator;
  @ViewChild('sortPermitidos', { static: true }) sortPermitidos: MatSort;
  @ViewChild('sortNoPermitidos', { static: true }) sortNoPermitidos: MatSort;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.CODIGOS_ECONOMICOS, actionService);
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaConceptoGastoCodigoEcFragment;
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcComponent.name, 'constructor()', 'end');

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
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.dataSourcePermitidos = new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>>();
    this.dataSourcePermitidos.paginator = this.paginatorPermitidos;
    this.dataSourcePermitidos.sort = this.sortPermitidos;
    this.dataSourceNoPermitidos = new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>>();
    this.dataSourceNoPermitidos.paginator = this.paginatorNoPermitidos;
    this.dataSourceNoPermitidos.sort = this.sortNoPermitidos;
    this.subscriptions.push(this.formPart?.convocatoriaConceptoGastoCodigoEcPermitido$.subscribe(elements => {
      this.dataSourcePermitidos.data = elements;
    }));
    this.subscriptions.push(this.formPart?.convocatoriaConceptoGastoCodigoEcNoPermitido$.subscribe(elements => {
      this.dataSourceNoPermitidos.data = elements;
    }));

    this.dataSourcePermitidos.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>, property: string) => {
        switch (property) {
          case 'convocatoriaConceptoGasto.conceptoGasto.nombre':
            return wrapper.value.convocatoriaConceptoGasto.conceptoGasto.nombre;
          case 'codigoEconomicoRef':
            return wrapper.value.codigoEconomicoRef;
          case 'fechaInicio':
            return wrapper.value.fechaInicio ? new Date(wrapper.value.fechaInicio).getTime() : 0;
          case 'fechaFin':
            return wrapper.value.fechaFin ? new Date(wrapper.value.fechaFin).getTime() : 0;
          case 'convocatoriaConceptoGasto.observaciones':
            return wrapper.value.convocatoriaConceptoGasto.observaciones;
          default:
            return wrapper[property];
        }
      };

    this.dataSourceNoPermitidos.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>, property: string) => {
        switch (property) {
          case 'convocatoriaConceptoGasto.conceptoGasto.nombre':
            return wrapper.value.convocatoriaConceptoGasto.conceptoGasto.nombre;
          case 'codigoEconomicoRef':
            return wrapper.value.codigoEconomicoRef;
          case 'fechaInicio':
            return wrapper.value.fechaInicio ? new Date(wrapper.value.fechaInicio).getTime() : 0;
          case 'fechaFin':
            return wrapper.value.fechaFin ? new Date(wrapper.value.fechaFin).getTime() : 0;
          case 'convocatoriaConceptoGasto.observaciones':
            return wrapper.value.convocatoriaConceptoGasto.observaciones;
          default:
            return wrapper[property];
        }
      };
  }

  openModal(wrapper?: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>, numFila?: number): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcComponent.name, `${this.openModal.name}()`, 'start');

    const listadoTabla = wrapper.value.convocatoriaConceptoGasto.permitido ? this.dataSourcePermitidos.data.map(
      wrapperPermitidos => wrapperPermitidos.value)
      : this.dataSourceNoPermitidos.data.map(wrapperNoPermitidos => wrapperNoPermitidos.value);

    listadoTabla.splice(numFila, 1);

    const listadoGastos = wrapper.value.convocatoriaConceptoGasto.permitido ?
      this.actionService.getElegibilidadPermitidos().map(permitidos => permitidos.value) :
      this.actionService.getElegibilidadNoPermitidos().map(noPermitidos => noPermitidos.value);

    const data = {
      convocatoriaConceptoGastoCodigoEc: wrapper.value,
      convocatoriaConceptoGastoCodigoEcsTabla: listadoTabla,
      convocatoriaConceptoGastos: listadoGastos,
      editModal: true
    } as IConvocatoriaConceptoGastoCodigoEcModalComponent;

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
        this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, `${this.openModal.name}()`, 'end');
      }
    );
  }

  openModalCrear(permitido: boolean): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcComponent.name, `${this.openModal.name}()`, 'start');
    const listadoTabla = permitido ? this.dataSourcePermitidos.data.map(wrapperPermitidos => wrapperPermitidos.value)
      : this.dataSourceNoPermitidos.data.map(wrapperNoPermitidos => wrapperNoPermitidos.value);

    const listadoGastos = permitido ?
      this.actionService.getElegibilidadPermitidos().map(permitidos => permitidos.value) :
      this.actionService.getElegibilidadNoPermitidos().map(noPermitidos => noPermitidos.value);

    const data = {
      convocatoriaConceptoGastoCodigoEc: {
        convocatoriaConceptoGasto: {
          conceptoGasto: null,
          convocatoria: null,
          id: null,
          importeMaximo: null,
          numMeses: null,
          observaciones: null,
          permitido,
          porcentajeCosteIndirecto: null
        } as IConvocatoriaConceptoGasto,
        codigoEconomicoRef: null,
        enableAccion: true,
        fechaFin: null,
        fechaInicio: null,
        id: null
      } as IConvocatoriaConceptoGastoCodigoEc,
      convocatoriaConceptoGastoCodigoEcsTabla: listadoTabla,
      convocatoriaConceptoGastos: listadoGastos,
      editModal: false
    } as IConvocatoriaConceptoGastoCodigoEcModalComponent;

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ConvocatoriaConceptoGastoCodigoEcModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (convocatoriaConceptoGastoCodigoEc: IConvocatoriaConceptoGastoCodigoEc) => {
        if (convocatoriaConceptoGastoCodigoEc) {
          this.formPart.addConvocatoriaConceptoGastoCodigoEc(convocatoriaConceptoGastoCodigoEc);
        }
        this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name, `${this.openModal.name}()`, 'end');
      }
    );
  }

  deleteConvocatoriaConceptoGastoCodigoEc(wrapper: StatusWrapper<IConvocatoriaConceptoGastoCodigoEc>) {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name,
      `${this.deleteConvocatoriaConceptoGastoCodigoEc.name}(${wrapper})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteConvocatoriaConceptoGastoCodigoEc(wrapper);
          }
          this.logger.debug(ConvocatoriaConceptoGastoCodigoEcModalComponent.name,
            `${this.deleteConvocatoriaConceptoGastoCodigoEc.name}(${wrapper})`, 'end');
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaConceptoGastoCodigoEcComponent.name, 'ngOnDestroy()', 'end');
  }

}

