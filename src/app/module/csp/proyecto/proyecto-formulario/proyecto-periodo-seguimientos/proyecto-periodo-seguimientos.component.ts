import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ProyectoPeriodoSeguimientoService } from '@core/services/csp/proyecto-periodo-seguimiento.service';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { CSP_ROUTE_NAMES } from '../../../csp-route-names';
import { ProyectoActionService } from '../../proyecto.action.service';
import { ProyectoPeriodoSeguimientosFragment } from './proyecto-periodo-seguimientos.fragment';


const MSG_DELETE = marker('csp.proyecto.periodos-seguimiento-cientifico.borrar');
const MSG_DELETE_DOCUMENTOS = marker('csp.proyecto.periodos-seguimiento-cientifico.borrar.documentos');
export interface IProyectoPeriodoSeguimientoState {
  proyecto: IProyecto;
  proyectoPeriodoSeguimiento: IProyectoPeriodoSeguimiento;
  selectedProyectoPeriodoSeguimientos: IProyectoPeriodoSeguimiento[];
  readonly: boolean;
}

@Component({
  selector: 'sgi-proyecto-periodo-seguimientos',
  templateUrl: './proyecto-periodo-seguimientos.component.html',
  styleUrls: ['./proyecto-periodo-seguimientos.component.scss']
})
export class ProyectoPeriodoSeguimientosComponent extends FragmentComponent implements OnInit, OnDestroy {
  CSP_ROUTE_NAMES = CSP_ROUTE_NAMES;
  ROUTE_NAMES = ROUTE_NAMES;

  private subscriptions: Subscription[] = [];
  formPart: ProyectoPeriodoSeguimientosFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['numPeriodo', 'fechaInicio', 'fechaFin', 'fechaInicioPresentacion', 'fechaFinPresentacion', 'observaciones', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<IProyectoPeriodoSeguimiento>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public actionService: ProyectoActionService,
    private dialogService: DialogService,
    private proyectoPeriodoSeguimientoService: ProyectoPeriodoSeguimientoService
  ) {
    super(actionService.FRAGMENT.SEGUIMIENTO_CIENTIFICO, actionService);
    this.formPart = this.fragment as ProyectoPeriodoSeguimientosFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subscription = this.formPart.periodoSeguimientos$.subscribe(
      (proyectoPeriodoSeguimientos) => {
        this.dataSource.data = proyectoPeriodoSeguimientos;
      }
    );
    this.subscriptions.push(subscription);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IProyectoPeriodoSeguimiento>, property: string) => {
        switch (property) {
          default:
            return wrapper.value[property];
        }
      };
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  deleteProyectoPeriodoSeguimiento(wrapper: StatusWrapper<IProyectoPeriodoSeguimiento>) {
    this.proyectoPeriodoSeguimientoService.existsDocumentos(wrapper.value.id).subscribe(res => {
      if (res) {
        this.subscriptions.push(
          this.dialogService.showConfirmation(MSG_DELETE_DOCUMENTOS).subscribe(
            (aceptado) => {
              if (aceptado) {
                this.formPart.deletePeriodoSeguimiento(wrapper);
              }
            }
          )
        );
      } else {
        this.subscriptions.push(
          this.dialogService.showConfirmation(MSG_DELETE).subscribe(
            (aceptado) => {
              if (aceptado) {
                this.formPart.deletePeriodoSeguimiento(wrapper);
              }
            }
          )
        );
      }


    });
  }


  createState(wrapper?: StatusWrapper<IProyectoPeriodoSeguimiento>): IProyectoPeriodoSeguimientoState {
    const state: IProyectoPeriodoSeguimientoState = {
      proyecto: this.actionService.proyecto as IProyecto,
      proyectoPeriodoSeguimiento: wrapper ? wrapper.value : {} as IProyectoPeriodoSeguimiento,
      selectedProyectoPeriodoSeguimientos: this.dataSource.data.map(element => element.value),
      readonly: this.formPart.readOnly
    };
    return state;
  }

}
