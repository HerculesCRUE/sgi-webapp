import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IProyectoEntidadFinanciadora } from '@core/models/csp/proyecto-entidad-financiadora';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { EntidadFinanciadoraDataModal, EntidadFinanciadoraModalComponent } from '../../../modals/entidad-financiadora-modal/entidad-financiadora-modal.component';
import { ProyectoActionService } from '../../proyecto.action.service';
import { ProyectoEntidadesFinanciadorasFragment } from './proyecto-entidades-financiadoras.fragment';

const MODAL_ENTIDAD_FINANCIADORA_TITLE = marker('csp.proyecto.entidades.financiadoras.modal.title');
const MSG_DELETE = marker('csp.convocatoria.entidad.financiadora.listado.borrar');

@Component({
  selector: 'sgi-proyecto-entidades-financiadoras',
  templateUrl: './proyecto-entidades-financiadoras.component.html',
  styleUrls: ['./proyecto-entidades-financiadoras.component.scss']
})
export class ProyectoEntidadesFinanciadorasComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: ProyectoEntidadesFinanciadorasFragment;
  private subscriptions: Subscription[] = [];

  private columns = ['nombre', 'cif', 'fuenteFinanciacion', 'ambito', 'tipoFinanciacion',
    'porcentajeFinanciacion', 'acciones'];
  private elementsPage = [5, 10, 25, 100];

  columnsPropias = [...this.columns];
  columnsAjenas = [...this.columns];
  elementsPagePropias = [...this.elementsPage];
  elementsPageAjenas = [...this.elementsPage];

  dataSourcePropias = new MatTableDataSource<StatusWrapper<IProyectoEntidadFinanciadora>>();
  dataSourceAjenas = new MatTableDataSource<StatusWrapper<IProyectoEntidadFinanciadora>>();
  @ViewChild('paginatorPropias', { static: true }) paginatorPropias: MatPaginator;
  @ViewChild('sortPropias', { static: true }) sortPropias: MatSort;
  @ViewChild('paginatorAjenas', { static: true }) paginatorAjenas: MatPaginator;
  @ViewChild('sortAjenas', { static: true }) sortAjenas: MatSort;

  constructor(
    protected actionService: ProyectoActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.ENTIDADES_FINANCIADORAS, actionService);
    this.formPart = this.fragment as ProyectoEntidadesFinanciadorasFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSourcePropias.paginator = this.paginatorPropias;
    this.dataSourcePropias.sort = this.sortPropias;
    this.dataSourceAjenas.paginator = this.paginatorAjenas;
    this.dataSourceAjenas.sort = this.sortAjenas;
    this.subscriptions.push(
      this.formPart.entidadesPropias$.subscribe((elements) => this.dataSourcePropias.data = elements)
    );
    this.subscriptions.push(
      this.formPart.entidadesAjenas$.subscribe((elements) => this.dataSourceAjenas.data = elements)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(targetPropias: boolean, wrapper?: StatusWrapper<IProyectoEntidadFinanciadora>): void {
    const data: EntidadFinanciadoraDataModal = {
      title: MODAL_ENTIDAD_FINANCIADORA_TITLE,
      entidad: wrapper ? wrapper.value : {} as IProyectoEntidadFinanciadora,
      selectedEmpresas: targetPropias
        ? this.dataSourcePropias.data.map(entidad => entidad.value.empresa)
        : this.dataSourceAjenas.data.map(entidad => entidad.value.empresa),
      readonly: this.formPart.readonly
    };
    const config = {
      data
    };
    const dialogRef = this.matDialog.open(EntidadFinanciadoraModalComponent, config);
    dialogRef.afterClosed().subscribe(entidadFinanciadora => {
      if (entidadFinanciadora) {
        if (!wrapper) {
          this.formPart.addEntidadFinanciadora(entidadFinanciadora, targetPropias);
        } else if (!wrapper.created) {
          const entidad = new StatusWrapper<IProyectoEntidadFinanciadora>(wrapper.value);
          this.formPart.updateEntidadFinanciadora(entidad, targetPropias);
        }
      }
    });
  }

  deleteEntidadFinanciadora(targetPropias: boolean, wrapper: StatusWrapper<IProyectoEntidadFinanciadora>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteEntidadFinanciadora(wrapper, targetPropias);
          }
        }
      )
    );
  }
}
