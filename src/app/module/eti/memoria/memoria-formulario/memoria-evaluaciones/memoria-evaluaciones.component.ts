import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FragmentComponent } from '@core/component/fragment.component';
import { NGXLogger } from 'ngx-logger';
import { MatDialog } from '@angular/material/dialog';
import { MemoriaActionService } from '../../memoria.action.service';
import { Subscription } from 'rxjs';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DialogService } from '@core/services/dialog.service';
import { MemoriaEvaluacionesFragment } from './memoria-evaluaciones.fragment';
import { IEvaluacion } from '@core/models/eti/evaluacion';

import { MemoriaService } from '@core/services/eti/memoria.service';
import { openInformeFavorableMemoria, openInformeFavorableTipoRatificacion } from '@core/services/pentaho.service';

@Component({
  selector: 'sgi-memoria-evaluaciones',
  templateUrl: './memoria-evaluaciones.component.html',
  styleUrls: ['./memoria-evaluaciones.component.scss']
})
export class MemoriaEvaluacionesComponent extends FragmentComponent implements OnInit, OnDestroy {

  private formPart: MemoriaEvaluacionesFragment;
  private subscriptions: Subscription[] = [];

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  totalElementos: number;
  displayedColumns: string[] = ['tipoEvaluacion.nombre', 'version', 'dictamen.nombre', 'informeEvaluacion',
    'informeFavorable'];
  elementosPagina: number[] = [5, 10, 25, 100];
  dataSource: MatTableDataSource<StatusWrapper<IEvaluacion>> = new MatTableDataSource<StatusWrapper<IEvaluacion>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected readonly dialogService: DialogService,
    protected readonly logger: NGXLogger,
    protected matDialog: MatDialog,
    protected memoriaService: MemoriaService,
    actionService: MemoriaActionService) {

    super(actionService.FRAGMENT.EVALUACIONES, actionService);
    this.logger.debug(MemoriaEvaluacionesComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as MemoriaEvaluacionesFragment;
    this.logger.debug(MemoriaEvaluacionesComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {

    this.logger.debug(MemoriaEvaluacionesComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.dataSource = new MatTableDataSource<StatusWrapper<IEvaluacion>>();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.subscriptions.push(this.formPart.evaluaciones$.subscribe(elements => {
      this.dataSource.data = elements;
      this.totalElementos = elements.length;
    }));
    this.logger.debug(MemoriaEvaluacionesComponent.name, 'ngOnInit()', 'end');

  }

  hasInformeEvaluacion(evaluacion: StatusWrapper<IEvaluacion>): boolean {
    return ((evaluacion.value.tipoEvaluacion.id === 2 && (evaluacion.value.dictamen?.id === 2
      || evaluacion.value.dictamen?.id === 3 || evaluacion.value.dictamen?.id === 4))
      || (evaluacion.value.tipoEvaluacion.id === 4 && evaluacion.value.dictamen?.id === 8)
    );
  }

  hasInformeFavorable(evaluacion: StatusWrapper<IEvaluacion>): boolean {
    return ((evaluacion.value.tipoEvaluacion.id === 1 && evaluacion.value.dictamen?.id === 9)
      || (evaluacion.value.tipoEvaluacion.id === 2 && evaluacion.value.dictamen?.id === 1)
    );
  }

  generateInformeDictamenFavorable(idTipoMemoria: number, idEvaluacion: number): void {
    if (idTipoMemoria === 1) {
      openInformeFavorableMemoria(idEvaluacion);
    }
    else if (idTipoMemoria === 3) {
      openInformeFavorableTipoRatificacion(idEvaluacion);
    }
  }

  ngOnDestroy(): void {
    this.logger.debug(MemoriaEvaluacionesComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(MemoriaEvaluacionesComponent.name, 'ngOnDestroy()', 'end');
  }

}
