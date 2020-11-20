import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FragmentComponent } from '@core/component/fragment.component';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { BehaviorSubject, Subscription } from 'rxjs';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaHitosFragment } from './convocatoria-hitos.fragment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { MatDialog } from '@angular/material/dialog';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogService } from '@core/services/dialog.service';
import { ConvocatoriaHitosModalComponent, ConvocatoriaHitosModalComponentData } from '../../modals/convocatoria-hitos-modal/convocatoria-hitos-modal.component';

const MSG_DELETE = marker('csp.convocatoria.hito.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-hitos',
  templateUrl: './convocatoria-hitos.component.html',
  styleUrls: ['./convocatoria-hitos.component.scss']
})
export class ConvocatoriaHitosComponent extends FragmentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  private formPart: ConvocatoriaHitosFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  public disableAddHito = true;

  elementosPagina: number[] = [5, 10, 25, 100];
  displayedColumns: string[] = ['fechaInicio', 'tipoHito', 'comentario', 'aviso', 'acciones'];


  dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaHito>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly convocatoriaReunionService: ConvocatoriaService,
    private actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.HITOS, actionService);
    this.logger.debug(ConvocatoriaHitosComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaHitosFragment;
    this.logger.debug(ConvocatoriaHitosComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaHitosComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaHito>, property: string) => {
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
    this.disableAddHito = !Boolean(this.actionService.modeloEjecucionId);
    this.subscriptions.push(this.formPart.hitos$.subscribe(elements => {
      this.dataSource.data = elements;
      this.logger.debug(ConvocatoriaHitosComponent.name, 'ngOnInit()', 'end');
    }));
  }

  /**
   * Apertura de modal de hitos (edición/creación)
   * @param idHito Identificador de hito a editar.
   */
  openModal(wrapper?: StatusWrapper<IConvocatoriaHito>): void {
    this.logger.debug(ConvocatoriaHitosComponent.name, `${this.openModal.name}()`, 'start');
    const datosHito = {
      hito: wrapper ? wrapper.value : {} as IConvocatoriaHito,
      idModeloEjecucion: this.actionService.modeloEjecucionId
    } as ConvocatoriaHitosModalComponentData;
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: datosHito
    };
    const dialogRef = this.matDialog.open(ConvocatoriaHitosModalComponent, config);
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
        this.logger.debug(ConvocatoriaHitosComponent.name, `${this.openModal.name}()`, 'end');
      }
    );
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaHitosComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaHitosComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Desactivar convocatoria hito
   */
  deleteHito(wrapper: StatusWrapper<IConvocatoriaHito>) {
    this.logger.debug(ConvocatoriaHitosComponent.name,
      `${this.deleteHito.name}(${wrapper})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteHito(wrapper);
          }
          this.logger.debug(ConvocatoriaHitosComponent.name,
            `${this.deleteHito.name}(${wrapper})`, 'end');
        }
      )
    );
  }


}
