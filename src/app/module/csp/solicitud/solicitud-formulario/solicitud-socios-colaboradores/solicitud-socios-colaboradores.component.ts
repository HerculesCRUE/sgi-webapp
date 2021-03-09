import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CSP_ROUTE_NAMES } from '../../../csp-route-names';
import { SOLICITUD_PROYECTO_SOCIO_ROUTE } from '../../../solicitud-proyecto-socio/solicitud-proyecto-socio-route-names';
import { SolicitudActionService } from '../../solicitud.action.service';
import { SolicitudSociosColaboradoresFragment } from './solicitud-socios-colaboradores.fragment';

const MSG_DELETE = marker('csp.solicitud.socios.colaboradores.borrar');
const MSG_DELETE_CASCADE = marker('csp.solicitud.socios.colaboradores.borrar.vinculaciones');
const MSG_ERROR = marker('csp.solicitud.socios.colaboradores.borrar.vinculaciones.error');

export interface ISolicitudProyectoSocioState {
  solicitudId: number;
  coordinadorExterno: boolean;
  solicitudProyectoSocio: ISolicitudProyectoSocio;
  selectedSolicitudProyectoSocios: ISolicitudProyectoSocio[];
  readonly: boolean;
}

@Component({
  selector: 'sgi-solicitud-socios-colaboradores',
  templateUrl: './solicitud-socios-colaboradores.component.html',
  styleUrls: ['./solicitud-socios-colaboradores.component.scss']
})
export class SolicitudSociosColaboradoresComponent extends FragmentComponent implements OnInit, OnDestroy {

  CSP_ROUTE_NAMES = CSP_ROUTE_NAMES;
  SOLICITUD_PROYECTO_SOCIO_ROUTE = SOLICITUD_PROYECTO_SOCIO_ROUTE;
  ROUTE_NAMES = ROUTE_NAMES;

  private subscriptions: Subscription[] = [];
  formPart: SolicitudSociosColaboradoresFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['empresa', 'rolSocio', 'numInvestigadores', 'mesInicio', 'mesFin', 'importeSolicitado', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudProyectoSocio>>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public actionService: SolicitudActionService,
    private dialogService: DialogService,
    private solicitudProyectoSocioService: SolicitudProyectoSocioService,
    private snackBarService: SnackBarService
  ) {
    super(actionService.FRAGMENT.SOCIOS_COLABORADORES, actionService);
    this.formPart = this.fragment as SolicitudSociosColaboradoresFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subscription = this.formPart.proyectoSocios$.subscribe(
      (proyectoSocios) => {
        this.dataSource.data = proyectoSocios;
      }
    );
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (wrapper, property) => {
      switch (property) {
        case 'empresa':
          return wrapper.value.empresa.razonSocial;
        case 'rolSocio':
          return wrapper.value.rolSocio.nombre;
        default:
          return wrapper.value[property];
      }
    };
    this.subscriptions.push(subscription);
    this.actionService.hasSocioColaborador();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  deleteProyectoSocio(wrapper: StatusWrapper<ISolicitudProyectoSocio>): void {
    this.subscriptions.push(
      this.solicitudProyectoSocioService.vinculaciones(wrapper.value.id).pipe(
        map(res => {
          return res ? MSG_DELETE_CASCADE : MSG_DELETE;
        }),
        switchMap(message => {
          return this.dialogService.showConfirmation(message);
        }),
      ).subscribe(
        (aceptado) => {
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

  createState(wrapper?: StatusWrapper<ISolicitudProyectoSocio>): ISolicitudProyectoSocioState {
    const solicitudProyectoSocio: ISolicitudProyectoSocio = {
      empresa: undefined,
      id: undefined,
      importeSolicitado: undefined,
      mesFin: undefined,
      mesInicio: undefined,
      numInvestigadores: undefined,
      rolSocio: undefined,
      solicitudProyectoDatos: undefined
    };
    const state: ISolicitudProyectoSocioState = {
      solicitudId: this.fragment.getKey() as number,
      coordinadorExterno: this.actionService.coordinadorExterno,
      solicitudProyectoSocio: wrapper ? wrapper.value : solicitudProyectoSocio,
      selectedSolicitudProyectoSocios: this.dataSource.data.map(element => element.value),
      readonly: this.formPart.readonly
    };
    return state;
  }
}
