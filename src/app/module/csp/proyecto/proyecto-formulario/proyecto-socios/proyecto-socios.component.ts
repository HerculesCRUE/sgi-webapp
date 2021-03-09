import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { ProyectoSocioService } from '@core/services/csp/proyecto-socio.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CSP_ROUTE_NAMES } from '../../../csp-route-names';
import { ProyectoActionService } from '../../proyecto.action.service';
import { ProyectoSociosFragment } from './proyecto-socios.fragment';

const MSG_DELETE = marker('csp.proyecto.socios.borrar');
const MSG_DELETE_CASCADE = marker('csp.proyecto.socios.borrar.relaciones');
const MSG_ERROR = marker('csp.proyecto.socios.borrar.relaciones.error');


export interface IProyectoSocioState {
  proyectoId: number;
  coordinadorExterno: boolean;
  proyectoSocio: IProyectoSocio;
  selectedProyectoSocios: IProyectoSocio[];
  urlProyecto: string;
}

@Component({
  selector: 'sgi-proyecto-socios',
  templateUrl: './proyecto-socios.component.html',
  styleUrls: ['./proyecto-socios.component.scss']
})
export class ProyectoSociosComponent extends FragmentComponent implements OnInit, OnDestroy {
  CSP_ROUTE_NAMES = CSP_ROUTE_NAMES;
  PROYECTO_SOCIO_ROUTE = CSP_ROUTE_NAMES.PROYECTO_SOCIO;
  ROUTE_NAMES = ROUTE_NAMES;

  private subscriptions: Subscription[] = [];
  formPart: ProyectoSociosFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['empresa.numeroDocumento', 'empresa.razonSocial', 'rolSocio.nombre', 'numInvestigadores', 'fechaInicio', 'fechaFin', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<IProyectoSocio>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public actionService: ProyectoActionService,
    private dialogService: DialogService,
    private router: Router,
    private proyectoSocioService: ProyectoSocioService,
    private snackBarService: SnackBarService
  ) {
    super(actionService.FRAGMENT.SOCIOS, actionService);
    this.formPart = this.fragment as ProyectoSociosFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subscription = this.formPart.proyectoSocios$.subscribe(
      (proyectoSocios) => {
        this.dataSource.data = proyectoSocios;
      }
    );
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  deleteProyectoSocio(wrapper: StatusWrapper<IProyectoSocio>): void {
    this.subscriptions.push(
      this.proyectoSocioService.vinculaciones(wrapper.value.id).pipe(
        map(res => {
          return res ? MSG_DELETE_CASCADE : MSG_DELETE;
        }),
        switchMap(message => {
          return this.dialogService.showConfirmation(message);
        }),
      ).subscribe(
        aceptado => {
          if (aceptado) {
            this.formPart.deleteProyectoSocio(wrapper);
          }
        },
        () => {
          this.snackBarService.showError(MSG_ERROR);
        }
      )
    );
  }

  createState(wrapper?: StatusWrapper<IProyectoSocio>): IProyectoSocioState {
    const state: IProyectoSocioState = {
      proyectoId: this.fragment.getKey() as number,
      coordinadorExterno: this.actionService.coordinadorExterno,
      proyectoSocio: wrapper ? wrapper.value : {} as IProyectoSocio,
      selectedProyectoSocios: this.dataSource.data.map(element => element.value),
      urlProyecto: this.router.url
    };
    return state;
  }

}
