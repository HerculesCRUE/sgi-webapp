import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { ISolicitudHito } from '@core/models/csp/solicitud-hito';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { DialogService } from '@core/services/dialog.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription } from 'rxjs';
import { SolicitiudHitosModalComponent, SolicitudHitosModalComponentData } from '../../modals/solicitud-hitos-modal/solicitud-hitos-modal.component';
import { SolicitudActionService } from '../../solicitud.action.service';
import { SolicitudHitosFragment } from './solicitud-hitos.fragment';


const MSG_DELETE = marker('csp.solicitud.hito.listado.borrar');
@Component({
  selector: 'sgi-solicitud-hitos',
  templateUrl: './solicitud-hitos.component.html',
  styleUrls: ['./solicitud-hitos.component.scss']
})
export class SolicitudHitosComponent extends FragmentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  formPart: SolicitudHitosFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  elementosPagina = [5, 10, 25, 100];
  displayedColumns = ['fechaInicio', 'tipoHito', 'comentario', 'aviso', 'acciones'];

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudHito>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected convocatoriaReunionService: ConvocatoriaService,
    private actionService: SolicitudActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService) {

    super(actionService.FRAGMENT.HITOS, actionService);

    this.formPart = this.fragment as SolicitudHitosFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<ISolicitudHito>, property: string) => {
        switch (property) {
          case 'fechaInicio':
            return wrapper.value.fecha;
          case 'tipoHito':
            return wrapper.value.tipoHito.nombre;
          case 'comentario':
            return wrapper.value.comentario;
          default:
            return wrapper[property];
        }
      };

    this.dataSource.sort = this.sort;

    this.subscriptions.push(this.formPart.hitos$.subscribe(elements => {
      this.dataSource.data = elements;
    }));
  }


  /**
   * Apertura de modal de hitos (edición/creación)
   * @param idHito Identificador de hito a editar.
   */
  openModal(wrapper?: StatusWrapper<ISolicitudHito>): void {
    const data: SolicitudHitosModalComponentData = {
      hitos: this.dataSource.data.map(hito => hito.value),
      hito: wrapper ? wrapper.value : {} as ISolicitudHito,
      idModeloEjecucion: this.formPart.solicitud.convocatoria.modeloEjecucion.id,
      readonly: this.formPart.readonly
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(SolicitiudHitosModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (convocatoriaHito) => {
        if (convocatoriaHito) {
          if (wrapper) {
            if (!wrapper.created) {
              wrapper.setEdited();
            }
            this.formPart.setChanges(true);
          } else {
            this.formPart.addHito(convocatoriaHito);
          }
        }
      }
    );

  }

  /**
   * Desactivar solicitud hito
   */
  deleteHito(wrapper: StatusWrapper<ISolicitudHito>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteHito(wrapper);
          }
        }
      )
    );

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
