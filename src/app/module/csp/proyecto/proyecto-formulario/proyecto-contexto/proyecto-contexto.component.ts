import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IProyectoContexto, PROPIEDAD_RESULTADOS_MAP } from '@core/models/csp/proyecto-contexto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { Subscription } from 'rxjs';
import { ProyectoContextoModalComponent } from '../../modals/proyecto-contexto-modal/proyecto-contexto-modal.component';
import { ProyectoActionService } from '../../proyecto.action.service';
import { AreaTematicaProyectoData, ProyectoContextoFragment } from './proyecto-contexto.fragment';

@Component({
  selector: 'sgi-proyecto-contexto',
  templateUrl: './proyecto-contexto.component.html',
  styleUrls: ['./proyecto-contexto.component.scss']
})
export class ProyectoContextoComponent extends FormFragmentComponent<IProyectoContexto> implements OnInit {

  formPart: ProyectoContextoFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  totalElementos: number;
  displayedColumns: string[];
  elementosPagina: number[];

  convocatoriaAreaTematicas = new MatTableDataSource<AreaTematicaProyectoData>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  columns = ['nombreRaizArbol', 'areaTematicaConvocatoria', 'areaTematicaProyecto', 'acciones'];

  private subscriptions = [] as Subscription[];

  constructor(
    protected actionService: ProyectoActionService,
    private matDialog: MatDialog
  ) {
    super(actionService.FRAGMENT.CONTEXTO_PROYECTO, actionService);
    this.formPart = this.fragment as ProyectoContextoFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadAreaTematicas();
  }

  private loadAreaTematicas(): void {
    this.subscriptions.push(this.formPart.areasTematicas$.subscribe(
      data => this.convocatoriaAreaTematicas.data = data
    ));
    this.convocatoriaAreaTematicas.paginator = this.paginator;
    this.convocatoriaAreaTematicas.sort = this.sort;
  }

  openModal(wrapper?: AreaTematicaProyectoData): void {
    const newData: AreaTematicaProyectoData = {
      root: undefined,
      areaTematica: undefined,
    };

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: wrapper ? wrapper : newData
    };
    const dialogRef = this.matDialog.open(ProyectoContextoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (wrapper) {
          this.formPart.updateAreaTematica(result);
        } else {
          this.formPart.addAreaTematica(result);
        }
      }
    );
  }


  get PROPIEDAD_RESULTADOS_MAP() {
    return PROPIEDAD_RESULTADOS_MAP;
  }

}
