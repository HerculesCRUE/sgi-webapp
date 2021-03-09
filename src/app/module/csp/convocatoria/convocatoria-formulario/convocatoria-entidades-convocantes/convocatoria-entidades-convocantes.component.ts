import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { Subscription } from 'rxjs/internal/Subscription';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaEntidadConvocanteModalComponent, ConvocatoriaEntidadConvocanteModalData } from '../../modals/convocatoria-entidad-convocante-modal/convocatoria-entidad-convocante-modal.component';
import { ConvocatoriaEntidadConvocanteData, ConvocatoriaEntidadesConvocantesFragment } from './convocatoria-entidades-convocantes.fragment';

const MSG_DELETE = marker('csp.convocatoria.entidad.convocante.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-entidades-convocantes',
  templateUrl: './convocatoria-entidades-convocantes.component.html',
  styleUrls: ['./convocatoria-entidades-convocantes.component.scss']
})
export class ConvocatoriaEntidadesConvocantesComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: ConvocatoriaEntidadesConvocantesFragment;
  private subscriptions: Subscription[] = [];

  columns = ['nombre', 'cif', 'plan', 'programa', 'itemPrograma', 'acciones'];
  elementsPage = [5, 10, 25, 100];

  dataSource = new MatTableDataSource<ConvocatoriaEntidadConvocanteData>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.ENTIDADES_CONVOCANTES, actionService);
    this.formPart = this.fragment as ConvocatoriaEntidadesConvocantesFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.subscriptions.push(this.formPart.data$.subscribe(
      (data) => {
        this.dataSource.data = data;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(value?: ConvocatoriaEntidadConvocanteData): void {
    const data: ConvocatoriaEntidadConvocanteModalData = {
      entidadConvocanteData: value,
      selectedEmpresas: this.dataSource.data.map((convocanteData) => convocanteData.empresaEconomica),
      readonly: this.formPart.readonly
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data
    };
    const dialogRef = this.matDialog.open(ConvocatoriaEntidadConvocanteModalComponent, config);
    dialogRef.afterClosed().subscribe((entidadConvocante: ConvocatoriaEntidadConvocanteModalData) => {
      if (entidadConvocante) {
        if (value) {
          this.formPart.updateConvocatoriaEntidadConvocante(entidadConvocante.entidadConvocanteData);
        } else {
          this.formPart.addConvocatoriaEntidadConvocante(entidadConvocante.entidadConvocanteData);
        }
      }
    });
  }

  deleteConvocatoriaEntidadConvocante(data: ConvocatoriaEntidadConvocanteData) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteConvocatoriaEntidadConvocante(data);
          }
        }
      )
    );
  }
}
