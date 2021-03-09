import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { Subscription } from 'rxjs';
import { SolicitudAreaTematicaModalComponent } from '../../modals/solicitud-area-tematica-modal/solicitud-area-tematica-modal.component';
import { SolicitudActionService } from '../../solicitud.action.service';
import { AreaTematicaSolicitudData, SolicitudProyectoFichaGeneralFragment } from './solicitud-proyecto-ficha-general.fragment';

@Component({
  selector: 'sgi-solicitud-proyecto-ficha-general',
  templateUrl: './solicitud-proyecto-ficha-general.component.html',
  styleUrls: ['./solicitud-proyecto-ficha-general.component.scss']
})
export class SolicitudProyectoFichaGeneralComponent extends FormFragmentComponent<ISolicitudProyectoDatos> implements OnInit, OnDestroy {
  formPart: SolicitudProyectoFichaGeneralFragment;
  fxFlexProperties: FxFlexProperties;
  fxFlexProperties100: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  private subscriptions = [] as Subscription[];

  convocatoriaAreaTematicas = new MatTableDataSource<AreaTematicaSolicitudData>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  columns = ['nombreRaizArbol', 'areaTematicaConvocatoria', 'areaTematicaSolicitud', 'acciones'];

  constructor(
    protected actionService: SolicitudActionService,
    private matDialog: MatDialog
  ) {
    super(actionService.FRAGMENT.PROYECTO_DATOS, actionService);
    this.formPart = this.fragment as SolicitudProyectoFichaGeneralFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexProperties100 = new FxFlexProperties();
    this.fxFlexProperties100.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties100.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties100.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties100.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadAreaTematicas();

    this.subscriptions.push(
      this.formGroup.controls.presupuestoPorEntidades.valueChanges.subscribe(value => {
        this.actionService.isPresupuestoPorEntidades = value ? value : false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private loadAreaTematicas(): void {
    const subscription = this.formPart.areasTematicas$.subscribe(
      data => this.convocatoriaAreaTematicas.data = data
    );
    this.subscriptions.push(subscription);
    this.convocatoriaAreaTematicas.paginator = this.paginator;
    this.convocatoriaAreaTematicas.sort = this.sort;
  }

  openModal(data: AreaTematicaSolicitudData): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(SolicitudAreaTematicaModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: AreaTematicaSolicitudData) => {
        this.formPart.solicitudProyectoDatos.areaTematica = result?.areaTematicaSolicitud;
        this.formPart.setChanges(true);
      }
    );
  }
}
