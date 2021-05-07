import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { MSG_PARAMS } from '@core/i18n';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ProyectoPeriodoSeguimientoService } from '@core/services/csp/proyecto-periodo-seguimiento.service';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProyectoActionService } from '../../proyecto.action.service';
import { ProyectoPeriodoSeguimientosFragment } from './proyecto-periodo-seguimientos.fragment';

const MSG_DELETE = marker('msg.delete.entity');
const MSG_DELETE_DOCUMENTOS = marker('msg.csp.proyecto-periodo-seguimiento-cientifico.documento.delete');
const PROYECTO_PERIODO_SEGUIMIENTO_CIENTIFICO_KEY = marker('csp.proyecto-periodo-seguimiento-cientifico');

@Component({
  selector: 'sgi-proyecto-periodo-seguimientos',
  templateUrl: './proyecto-periodo-seguimientos.component.html',
  styleUrls: ['./proyecto-periodo-seguimientos.component.scss']
})
export class ProyectoPeriodoSeguimientosComponent extends FragmentComponent implements OnInit, OnDestroy {
  ROUTE_NAMES = ROUTE_NAMES;

  private subscriptions: Subscription[] = [];
  formPart: ProyectoPeriodoSeguimientosFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = ['numPeriodo', 'fechaInicio', 'fechaFin', 'fechaInicioPresentacion', 'fechaFinPresentacion', 'observaciones', 'acciones'];

  msgParamEntity = {};
  textoDelete: string;

  dataSource = new MatTableDataSource<StatusWrapper<IProyectoPeriodoSeguimiento>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public actionService: ProyectoActionService,
    private dialogService: DialogService,
    private proyectoPeriodoSeguimientoService: ProyectoPeriodoSeguimientoService,
    private readonly translate: TranslateService
  ) {
    super(actionService.FRAGMENT.SEGUIMIENTO_CIENTIFICO, actionService);
    this.formPart = this.fragment as ProyectoPeriodoSeguimientosFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
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

  private setupI18N(): void {
    this.translate.get(
      PROYECTO_PERIODO_SEGUIMIENTO_CIENTIFICO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamEntity = { entity: value });

    this.translate.get(
      PROYECTO_PERIODO_SEGUIMIENTO_CIENTIFICO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_DELETE,
          { entity: value, ...MSG_PARAMS.GENDER.MALE }
        );
      })
    ).subscribe((value) => this.textoDelete = value);
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
          this.dialogService.showConfirmation(this.textoDelete).subscribe(
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

}
