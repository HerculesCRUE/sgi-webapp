import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FragmentComponent } from '@core/component/fragment.component';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs/internal/Subscription';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaEntidadConvocanteData, ConvocatoriaEntidadesConvocantesFragment } from './convocatoria-entidades-convocantes.fragment';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { MatDialog } from '@angular/material/dialog';
import { ConvocatoriaEntidadConvocanteModalComponent, ConvocatoriaEntidadConvocanteModalData } from '../../modals/convocatoria-entidad-convocante-modal/convocatoria-entidad-convocante-modal.component';
import { DialogService } from '@core/services/dialog.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const MSG_DELETE = marker('csp.convocatoria.entidad.convocante.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-entidades-convocantes',
  templateUrl: './convocatoria-entidades-convocantes.component.html',
  styleUrls: ['./convocatoria-entidades-convocantes.component.scss']
})
export class ConvocatoriaEntidadesConvocantesComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ConvocatoriaEntidadesConvocantesFragment;
  private subscriptions: Subscription[] = [];

  columns = ['nombre', 'cif', 'plan', 'programa', 'itemPrograma', 'acciones'];
  elementsPage = [5, 10, 25, 100];

  dataSource = new MatTableDataSource<ConvocatoriaEntidadConvocanteData>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected logger: NGXLogger,
    protected actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.ENTIDADES_CONVOCANTES, actionService);
    this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaEntidadesConvocantesFragment;
    this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.subscriptions.push(this.formPart.data$.subscribe(
      (data) => {
        this.dataSource.data = data;
        this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, `getDataSource()`, 'end');
      })
    );
    this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, 'ngOnDestroy()', 'end');
  }

  openModal(value?: ConvocatoriaEntidadConvocanteData): void {
    this.logger.debug(ConvocatoriaEntidadesConvocantesComponent.name, `openModal()`, 'start');

    const data: ConvocatoriaEntidadConvocanteModalData = {
      entidadConvocanteData: value,
      selectedEmpresas: this.formPart.data$.value.map((convocanteData) => convocanteData.empresaEconomica)
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
      this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, `openModal()`, 'end');
    });
  }

  deleteConvocatoriaEntidadConvocante(data: ConvocatoriaEntidadConvocanteData) {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `deleteConvocatoriaEntidadConvocante(${data})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteConvocatoriaEntidadConvocante(data);
          }
          this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
            `deleteConvocatoriaEntidadConvocante(${data})`, 'end');
        }
      )
    );
  }
}
