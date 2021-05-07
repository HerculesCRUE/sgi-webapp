import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { MSG_PARAMS } from '@core/i18n';
import { ISolicitudProyectoPresupuesto } from '@core/models/csp/solicitud-proyecto-presupuesto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { PartidaGastoDataModal, PartidaGastoModalComponent } from '../../../shared/partida-gasto-modal/partida-gasto-modal.component';
import { SOLICITUD_ROUTE_NAMES } from '../../solicitud-route-names';
import { SolicitudActionService } from '../../solicitud.action.service';
import { SolicitudProyectoPresupuestoGlobalFragment } from './solicitud-proyecto-presupuesto-global.fragment';

const MSG_DELETE = marker('msg.delete.entity');
const SOLICITUD_PROYECTO_PRESUPUESTO_GLOBAL_PARTIDA_GASTO_KEY = marker('csp.solicitud-proyecto-presupuesto-global-partida-gasto');
const SOLICITUD_PROYECTO_PRESUPUESTO_PARTIDA_GASTO_KEY = marker('csp.solicitud-desglose-presupuesto.global.partidas-gasto');

@Component({
  selector: 'sgi-solicitud-proyecto-presupuesto-global',
  templateUrl: './solicitud-proyecto-presupuesto-global.component.html',
  styleUrls: ['./solicitud-proyecto-presupuesto-global.component.scss']
})
export class SolicitudProyectoPresupuestoGlobalComponent extends FragmentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  formPart: SolicitudProyectoPresupuestoGlobalFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns = [
    'conceptoGasto',
    'anualidad',
    'importe',
    'observaciones',
    'acciones'
  ];
  elementsPage = [5, 10, 25, 100];

  msgParamPartidaGastoEntity = {};
  msgParamEntity = {};
  textoDelete: string;

  dataSource = new MatTableDataSource<StatusWrapper<ISolicitudProyectoPresupuesto>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actionService: SolicitudActionService,
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private dialogService: DialogService,
    private readonly translate: TranslateService
  ) {
    super(actionService.FRAGMENT.DESGLOSE_PRESUPUESTO_GLOBAL, actionService);
    this.formPart = this.fragment as SolicitudProyectoPresupuestoGlobalFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
    this.actionService.datosProyectoComplete$.pipe(
      take(1)
    ).subscribe(
      (complete) => {
        if (!complete) {
          this.router.navigate(['../', SOLICITUD_ROUTE_NAMES.PROYECTO_DATOS], { relativeTo: this.route });
        }
      }
    );

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor =
      (partidaGasto: StatusWrapper<ISolicitudProyectoPresupuesto>, property: string) => {
        switch (property) {
          case 'conceptoGasto':
            return partidaGasto.value.conceptoGasto?.nombre;
          case 'anualidad':
            return partidaGasto.value.anualidad;
          case 'importe':
            return partidaGasto.value.importeSolicitado;
          case 'observaciones':
            return partidaGasto.value.observaciones;
          default:
            return partidaGasto[property];
        }
      };

    const subcription = this.formPart.partidasGastos$
      .subscribe((partidasGasto) => {
        this.dataSource.data = partidasGasto;
      });
    this.subscriptions.push(subcription);
  }

  private setupI18N(): void {
    this.translate.get(
      SOLICITUD_PROYECTO_PRESUPUESTO_GLOBAL_PARTIDA_GASTO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamEntity = { entity: value });

    this.translate.get(
      SOLICITUD_PROYECTO_PRESUPUESTO_PARTIDA_GASTO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamPartidaGastoEntity = { entity: value });

    this.translate.get(
      SOLICITUD_PROYECTO_PRESUPUESTO_GLOBAL_PARTIDA_GASTO_KEY,
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

  deletePartidaGasto(wrapper: StatusWrapper<ISolicitudProyectoPresupuesto>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(this.textoDelete).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deletePartidaGasto(wrapper);
          }
        }
      )
    );
  }

  openModal(wrapper?: StatusWrapper<ISolicitudProyectoPresupuesto>): void {
    const data: PartidaGastoDataModal = {
      partidaGasto: wrapper ? wrapper.value : {} as ISolicitudProyectoPresupuesto,
      convocatoriaId: this.actionService.convocatoriaId,
      readonly: this.formPart.readonly
    };

    const config = {
      panelClass: 'sgi-dialog-container',
      data
    };

    const dialogRef = this.matDialog.open(PartidaGastoModalComponent, config);
    dialogRef.afterClosed().subscribe((partidaGasto) => {
      if (partidaGasto) {
        if (!wrapper) {
          this.formPart.addPartidaGasto(partidaGasto);
        } else if (!wrapper.created) {
          const wrapperUpdated = new StatusWrapper<ISolicitudProyectoPresupuesto>(wrapper.value);
          this.formPart.updatePartidaGasto(wrapperUpdated);
        }
      }
    });
  }

}
