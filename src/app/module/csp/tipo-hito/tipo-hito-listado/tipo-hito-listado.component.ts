import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ITipoHito } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoHitoService } from '@core/services/csp/tipo-hito.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { EMPTY, Observable, of, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { TipoHitoModalComponent } from '../tipo-hito-modal/tipo-hito-modal.component';

const MSG_ERROR = marker('csp.tipo.hito.listado.error');
const MSG_ERROR_SAVE = marker('csp.tipo.hito.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.tipo.hito.actualizar.error');
const MSG_SAVE = marker('csp.tipo.hito.añadir');
const MSG_UPDATE = marker('csp.tipo.hito.actualizar');
const MSG_DEACTIVATE = marker('csp.tipo.hito.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.tipo.hito.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.tipo.hito.desactivar.error');
const MSG_REACTIVE = marker('csp.tipo.hito.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.tipo.hito.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.tipo.hito.reactivar.error');

@Component({
  selector: 'sgi-tipo-hito-listado',
  templateUrl: './tipo-hito-listado.component.html',
  styleUrls: ['./tipo-hito-listado.component.scss']
})
export class TipoHitoListadoComponent extends AbstractTablePaginationComponent<ITipoHito> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  tipoHitos$: Observable<ITipoHito[]>;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoHitoService: TipoHitoService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(TipoHitoListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(TipoHitoListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoHitoListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(''),
      activo: new FormControl('true')
    });
    this.filter = this.createFilters();
    this.logger.debug(TipoHitoListadoComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<ITipoHito>> {
    this.logger.debug(TipoHitoListadoComponent.name, `${this.createObservable.name}()`, 'start');
    const observable$ = this.tipoHitoService.findTodos(this.getFindOptions());
    this.logger.debug(TipoHitoListadoComponent.name, `${this.createObservable.name}()`, 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(TipoHitoListadoComponent.name, `${this.initColumns.name}()`, 'start');
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
    this.logger.debug(TipoHitoListadoComponent.name, `${this.initColumns.name}()`, 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(TipoHitoListadoComponent.name, `${this.loadTable.name}(${reset})`, 'start');
    this.tipoHitos$ = this.getObservableLoadTable(reset);
    this.logger.debug(TipoHitoListadoComponent.name, `${this.loadTable.name}(${reset})`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(TipoHitoListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    this.addFiltro(filtros, 'nombre', SgiRestFilterType.LIKE, this.formGroup.controls.nombre.value);
    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.logger.debug(TipoHitoListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  onClearFilters() {
    this.logger.debug(TipoHitoListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.onSearch();
    this.logger.debug(TipoHitoListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  /**
   * Abre un modal para añadir o actualizar un tipo de finalidad
   *
   * @param tipoHito Tipo de finalidad
   */
  openModal(tipoHito?: ITipoHito): void {
    this.logger.debug(TipoHitoListadoComponent.name, `${this.openModal.name}(tipoHito?: ITipoHito)`, 'start');
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoHito ? Object.assign({}, tipoHito) : { activo: true } as ITipoHito
    };
    const dialogRef = this.matDialog.open(TipoHitoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ITipoHito) => {
        if (result) {
          let subscription: Subscription;
          if (tipoHito) {
            subscription = this.tipoHitoService.update(tipoHito.id, result).subscribe(
              () => {
                this.snackBarService.showSuccess(MSG_UPDATE);
                this.loadTable();
                this.logger.debug(TipoHitoListadoComponent.name, `${this.openModal.name}(tipoHito?: ITipoHito)`, 'end');
              },
              () => {
                this.snackBarService.showError(MSG_ERROR_UPDATE);
                this.logger.error(TipoHitoListadoComponent.name, `${this.openModal.name}(tipoHito?: ITipoHito)`, 'error');
              }
            );
          } else {
            subscription = this.tipoHitoService.create(result).subscribe(
              () => {
                this.snackBarService.showSuccess(MSG_SAVE);
                this.loadTable();
                this.logger.debug(TipoHitoListadoComponent.name, `${this.openModal.name}(tipoHito?: ITipoHito)`, 'end');
              },
              () => {
                this.snackBarService.showError(MSG_ERROR_SAVE);
                this.logger.error(TipoHitoListadoComponent.name, `${this.openModal.name}(tipoHito?: ITipoHito)`, 'error');
              }
            );
          }
          this.suscripciones.push(subscription);
        }
      }
    );
  }

  /**
   * Desactivar tipo hito
   * @param tipoDocumento tipo hito
   */
  deactivateTipoHito(tipoHito: ITipoHito): void {
    this.logger.debug(TipoHitoListadoComponent.name, `${this.deactivateTipoHito.name}()`, 'start');
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoHitoService.deleteById(tipoHito.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_DEACTIVATE);
          this.loadTable();
          this.logger.debug(TipoHitoListadoComponent.name,
            `${this.deactivateTipoHito.name}(tipoHito: ${tipoHito})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.debug(TipoHitoListadoComponent.name,
            `${this.deactivateTipoHito.name}(tipoHito: ${tipoHito})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activamos un tipo hito desactivado
   * @param tipoHito tipo hito
   */
  activateTipoHito(tipoHito: ITipoHito): void {
    this.logger.debug(TipoHitoListadoComponent.name,
      `${this.activateTipoHito.name}(tipoHito: ${tipoHito})`, 'start');

    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoHito.activo = true;
          return this.tipoHitoService.update(tipoHito.id, tipoHito);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVE);
          this.loadTable();
          this.logger.debug(TipoHitoListadoComponent.name,
            `${this.activateTipoHito.name}(tipoHito: ${tipoHito})`, 'end');
        },
        () => {
          tipoHito.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.debug(TipoHitoListadoComponent.name,
            `${this.activateTipoHito.name}(tipoHito: ${tipoHito})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

}

