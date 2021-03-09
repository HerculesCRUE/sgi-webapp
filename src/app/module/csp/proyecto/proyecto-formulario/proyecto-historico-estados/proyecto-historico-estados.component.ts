import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FragmentComponent } from '@core/component/fragment.component';
import { ESTADO_MAP, IEstadoProyecto } from '@core/models/csp/estado-proyecto';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { ProyectoActionService } from '../../proyecto.action.service';
import { ProyectoHistoricoEstadosFragment } from './proyecto-historico-estados.fragment';

@Component({
  selector: 'sgi-proyecto-historico-estados',
  templateUrl: './proyecto-historico-estados.component.html',
  styleUrls: ['./proyecto-historico-estados.component.scss']
})
export class ProyectoHistoricoEstadosComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ProyectoHistoricoEstadosFragment;
  private subscriptions: Subscription[] = [];

  displayedColumns = ['estado', 'fechaEstado', 'comentario'];
  elementosPagina = [5, 10, 25, 100];

  dataSource: MatTableDataSource<IEstadoProyecto> = new MatTableDataSource<IEstadoProyecto>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  constructor(
    protected snackBarService: SnackBarService,
    private actionService: ProyectoActionService
  ) {
    super(actionService.FRAGMENT.HISTORICO_ESTADOS, actionService);
    this.formPart = this.fragment as ProyectoHistoricoEstadosFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.subscriptions.push(this.formPart.historicoEstado$.subscribe(elements => {
      this.dataSource.data = elements;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

