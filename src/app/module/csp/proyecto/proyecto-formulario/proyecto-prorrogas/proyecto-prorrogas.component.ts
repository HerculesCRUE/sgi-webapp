import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoProrroga, Tipo, TIPO_MAP } from '@core/models/csp/proyecto-prorroga';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ProyectoProrrogaService } from '@core/services/csp/proyecto-prorroga.service';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { CSP_ROUTE_NAMES } from '../../../csp-route-names';
import { ProyectoActionService } from '../../proyecto.action.service';
import { ProyectoProrrogasFragment } from './proyecto-prorrogas.fragment';

export interface IProyectoProrrogaState {
  proyecto: IProyecto;
  proyectoProrroga: IProyectoProrroga;
  selectedProyectoProrrogas: IProyectoProrroga[];
  readonly: boolean;
}

@Component({
  selector: 'sgi-proyecto-prorrogas',
  templateUrl: './proyecto-prorrogas.component.html',
  styleUrls: ['./proyecto-prorrogas.component.scss']
})
export class ProyectoProrrogasComponent extends FragmentComponent implements OnInit, OnDestroy {
  CSP_ROUTE_NAMES = CSP_ROUTE_NAMES;
  ROUTE_NAMES = ROUTE_NAMES;

  private subscriptions: Subscription[] = [];
  formPart: ProyectoProrrogasFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  lastProyectoProrroga: IProyectoProrroga;

  displayedColumns = ['numProrroga', 'fechaConcesion', 'tipo', 'fechaFin', 'importe', 'observaciones', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<IProyectoProrroga>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  get TIPO_MAP() {
    return TIPO_MAP;
  }

  constructor(
    public actionService: ProyectoActionService,
    private dialogService: DialogService,
    private proyectoProrrogaService: ProyectoProrrogaService
  ) {
    super(actionService.FRAGMENT.PRORROGAS, actionService);
    this.formPart = this.fragment as ProyectoProrrogasFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subscription = this.formPart.prorrogas$.subscribe(
      (proyectoProrrogas) => {
        this.dataSource.data = proyectoProrrogas;
        if (proyectoProrrogas.length > 0) {
          this.lastProyectoProrroga = proyectoProrrogas[proyectoProrrogas.length - 1].value;
        }
      }
    );
    this.subscriptions.push(subscription);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IProyectoProrroga>, property: string) => {
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

  deleteProyectoProrroga(wrapper: StatusWrapper<IProyectoProrroga>) {
    this.proyectoProrrogaService.existsDocumentos(wrapper.value.id).subscribe(res => {
      this.subscriptions.push(
        this.dialogService.showConfirmation(this.getInfoMensajeDelete(wrapper.value, res)).subscribe(
          (aceptado) => {
            if (aceptado) {
              this.formPart.deleteProrroga(wrapper);
              this.recalcularNumProrrogas();
            }
          }
        )
      );
    });
  }


  createState(wrapper?: StatusWrapper<IProyectoProrroga>): IProyectoProrrogaState {

    const state: IProyectoProrrogaState = {
      proyecto: this.actionService.proyecto,
      proyectoProrroga: wrapper ? wrapper.value : {} as IProyectoProrroga,
      selectedProyectoProrrogas: this.dataSource.data.map(element => element.value),
      readonly: this.actionService.readOnly ?
        this.actionService.readOnly : (wrapper ? wrapper.value.id !== this.lastProyectoProrroga.id : false)
    };

    return state;
  }

  /**
   * Recalcula los numeros de las prórrogas de todos las prórrogas de la tabla en funcion de su fecha de inicio.
   */
  private recalcularNumProrrogas(): void {
    let numProrroga = 1;
    this.dataSource.data
      .sort((a, b) => (a.value.fechaConcesion > b.value.fechaConcesion) ? 1 : ((b.value.fechaConcesion > a.value.fechaConcesion) ? -1 : 0));

    this.dataSource.data.forEach(c => {
      c.value.numProrroga = numProrroga++;
    });

    this.formPart.prorrogas$.next(this.dataSource.data);
  }


  private getInfoMensajeDelete(proyectoProrroga: IProyectoProrroga, documento: boolean) {
    switch (proyectoProrroga.tipo) {
      case Tipo.IMPORTE:
        return documento ? marker('csp.proyecto-prorroga.borrar.documentos.importe') : marker('csp.proyecto-prorroga.borrar.importe');
      case Tipo.TIEMPO:
        return documento ? marker('csp.proyecto-prorroga.borrar.documentos.tiempo') : marker('csp.proyecto-prorroga.borrar.tiempo');
      case Tipo.TIEMPO_IMPORTE:
        return documento ? marker('csp.proyecto-prorroga.borrar.documentos.tiempoImporte') : marker('csp.proyecto-prorroga.borrar.tiempoImporte');
      default:
        return '';
    }
  }

}
