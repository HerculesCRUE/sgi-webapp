import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoFinanciacionService } from '@core/services/csp/tipo-financiacion.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TipoFinanciacionModalComponent } from '../tipo-financiacion-modal/tipo-financiacion-modal.component';

const MSG_ERROR = marker('csp.tipo.financiacion.listado.error');
const MSG_ERROR_SAVE = marker('csp.tipo.financiacion.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.tipo.financiacion.actualizar.error');
const MSG_SAVE = marker('csp.tipo.financiacion.añadir');
const MSG_UPDATE = marker('csp.tipo.financiacion.actualizar');
const MSG_DEACTIVATE = marker('csp.tipo.financiacion.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.tipo.financiacion.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.tipo.financiacion.desactivar.error');
const MSG_REACTIVE = marker('csp.tipo.financiacion.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.tipo.financiacion.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.tipo.financiacion.reactivar.error');

@Component({
  selector: 'sgi-tipo-financiacion-listado',
  templateUrl: './tipo-financiacion-listado.component.html',
  styleUrls: ['./tipo-financiacion-listado.component.scss']
})
export class TipoFinanciacionListadoComponent extends AbstractTablePaginationComponent<ITipoFinanciacion> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  tipoFinanciaciones$: Observable<ITipoFinanciacion[]>;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoFinanciacionService: TipoFinanciacionService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(TipoFinanciacionListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(TipoFinanciacionListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoFinanciacionListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      activo: new FormControl('true')
    });
    this.filter = this.createFilters();
    this.logger.debug(TipoFinanciacionListadoComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<ITipoFinanciacion>> {
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.createObservable.name}()`, 'start');
    const observable$ = this.tipoFinanciacionService.findTodos(this.getFindOptions());
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.createObservable.name}()`, 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.initColumns.name}()`, 'start');
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.initColumns.name}()`, 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.loadTable.name}(${reset})`, 'start');
    this.tipoFinanciaciones$ = this.getObservableLoadTable(reset);
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.loadTable.name}(${reset})`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  onClearFilters() {
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.activo.setValue('');
    this.onSearch();
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  /**
   * Abre un modal para añadir o actualizar un tipo de financiacion
   *
   * @param tipoFinanciacion Tipo de financiacion
   */
  openModal(tipoFinanciacion?: ITipoFinanciacion): void {
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.openModal.name}(tipoFinanciacion?: ITipoFinanciacion)`, 'start');
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoFinanciacion
    };
    const dialogRef = this.matDialog.open(TipoFinanciacionModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ITipoFinanciacion) => {
        if (result) {
          const subscription = tipoFinanciacion ? this.tipoFinanciacionService.update(tipoFinanciacion.id, result) :
            this.tipoFinanciacionService.create(result);

          subscription.subscribe(
            () => {
              this.snackBarService.showSuccess(tipoFinanciacion ? MSG_UPDATE : MSG_SAVE);
              this.loadTable();
            },
            () => {
              this.snackBarService.showError(tipoFinanciacion ? MSG_ERROR_UPDATE : MSG_ERROR_SAVE);
            },
            () => {
              this.logger.debug(TipoFinanciacionModalComponent.name, `${this.openModal.name}(tipoFinanciacion?: IFuenteFinanciacion)`, 'end');
            });
        }
      }
    );
  }

  /**
   * Desactivar tipo financiacion
   * @param tipoFinanciacion tipo financiacion
   */
  deactivateTipoFinanciacion(tipoFinanciacion: ITipoFinanciacion): void {
    this.logger.debug(TipoFinanciacionListadoComponent.name, `${this.deactivateTipoFinanciacion.name}()`, 'start');
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoFinanciacionService.desactivar(tipoFinanciacion.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_DEACTIVATE);
          this.loadTable();
          this.logger.debug(TipoFinanciacionListadoComponent.name,
            `${this.deactivateTipoFinanciacion.name}(tipoFinanciacion: ${tipoFinanciacion})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.debug(TipoFinanciacionListadoComponent.name,
            `${this.deactivateTipoFinanciacion.name}(tipoFinanciacion: ${tipoFinanciacion})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activamos un tipo financiacion desactivado
   * @param tipoFinanciacion tipo financiacion
   */
  activateTipoFinanciacion(tipoFinanciacion: ITipoFinanciacion): void {
    this.logger.debug(TipoFinanciacionListadoComponent.name,
      `${this.activateTipoFinanciacion.name}(tipoFinanciacion: ${tipoFinanciacion})`, 'start');

    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoFinanciacion.activo = true;
          return this.tipoFinanciacionService.reactivar(tipoFinanciacion.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVE);
          this.loadTable();
          this.logger.debug(TipoFinanciacionListadoComponent.name,
            `${this.activateTipoFinanciacion.name}(tipoFinanciacion: ${tipoFinanciacion})`, 'end');
        },
        () => {
          tipoFinanciacion.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.debug(TipoFinanciacionListadoComponent.name,
            `${this.activateTipoFinanciacion.name}(tipoFinanciacion: ${tipoFinanciacion})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

}

