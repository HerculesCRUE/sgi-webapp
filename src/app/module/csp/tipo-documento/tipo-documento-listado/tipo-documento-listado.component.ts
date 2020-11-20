import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ITipoDocumento } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoDocumentoService } from '@core/services/csp/tipo-documento.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { EMPTY, Observable, of, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { TipoDocumentoModalComponent } from '../tipo-documento-modal/tipo-documento-modal.component';

const MSG_ERROR = marker('csp.tipo.documento.listado.error');
const MSG_ERROR_SAVE = marker('csp.tipo.documento.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.tipo.documento.actualizar.error');
const MSG_SAVE = marker('csp.tipo.documento.añadir');
const MSG_UPDATE = marker('csp.tipo.documento.actualizar');
const MSG_DEACTIVATE = marker('csp.tipo.documento.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.tipo.documento.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.tipo.documento.desactivar.error');
const MSG_REACTIVE = marker('csp.tipo.documento.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.tipo.documento.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.tipo.documento.reactivar.error');

@Component({
  selector: 'sgi-tipo-documento-listado',
  templateUrl: './tipo-documento-listado.component.html',
  styleUrls: ['./tipo-documento-listado.component.scss']
})
export class TipoDocumentoListadoComponent extends AbstractTablePaginationComponent<ITipoDocumento> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  tiposDocumento$: Observable<ITipoDocumento[]>;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoDocumentoService: TipoDocumentoService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(TipoDocumentoListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(TipoDocumentoListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoDocumentoListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(''),
      activo: new FormControl('true')
    });
    this.filter = this.createFilters();
    this.logger.debug(TipoDocumentoListadoComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<ITipoDocumento>> {
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.createObservable.name}()`, 'start');
    const observable$ = this.tipoDocumentoService.findTodos(this.getFindOptions());
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.createObservable.name}()`, 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.initColumns.name}()`, 'start');
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.initColumns.name}()`, 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.loadTable.name}(${reset})`, 'start');
    this.tiposDocumento$ = this.getObservableLoadTable(reset);
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.loadTable.name}(${reset})`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    this.addFiltro(filtros, 'nombre', SgiRestFilterType.LIKE, this.formGroup.controls.nombre.value);
    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  onClearFilters() {
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.onSearch();
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  /**
   * Abre un modal para añadir o actualizar
   *
   * @param tipoDocumento Tipo de documento
   */
  openModal(tipoDocumento?: ITipoDocumento): void {
    this.logger.debug(TipoDocumentoListadoComponent.name, `${this.openModal.name}(tipoDocumento: ${tipoDocumento})`, 'start');
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoDocumento ? Object.assign({}, tipoDocumento) : { activo: true } as ITipoDocumento
    };
    const dialogRef = this.matDialog.open(TipoDocumentoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ITipoDocumento) => {
        if (result) {
          let subscription: Subscription;
          if (tipoDocumento) {
            subscription = this.tipoDocumentoService.update(tipoDocumento.id, result).subscribe(
              () => {
                this.snackBarService.showSuccess(MSG_UPDATE);
                this.loadTable();
                this.logger.debug(TipoDocumentoListadoComponent.name,
                  `${this.openModal.name}(tipoDocumento: ${tipoDocumento})`, 'end');
              },
              () => {
                this.snackBarService.showError(MSG_ERROR_UPDATE);
                this.logger.error(TipoDocumentoListadoComponent.name,
                  `${this.openModal.name}(tipoDocumento: ${tipoDocumento})`, 'error');
              }
            );
          } else {
            subscription = this.tipoDocumentoService.create(result).subscribe(
              () => {
                this.snackBarService.showSuccess(MSG_SAVE);
                this.loadTable();
                this.logger.debug(TipoDocumentoListadoComponent.name,
                  `${this.openModal.name}(tipoDocumento: ${tipoDocumento})`, 'end');
              },
              () => {
                this.snackBarService.showError(MSG_ERROR_SAVE);
                this.logger.error(TipoDocumentoListadoComponent.name,
                  `${this.openModal.name}(tipoDocumento: ${tipoDocumento})`, 'error');
              }
            );
          }
          this.suscripciones.push(subscription);
        }
      }
    );
  }

  /**
   * Desactivar tipo documento
   * @param tipoDocumento tipo documento
   */
  deactivateTipoDocumento(tipoDocumento: ITipoDocumento): void {
    this.logger.debug(TipoDocumentoListadoComponent.name,
      `${this.deactivateTipoDocumento.name}(tipoDocumento: ${tipoDocumento})`, 'start');
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoDocumentoService.deleteById(tipoDocumento.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_DEACTIVATE);
          this.loadTable();
          this.logger.debug(TipoDocumentoListadoComponent.name,
            `${this.deactivateTipoDocumento.name}(tipoDocumento: ${tipoDocumento})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.debug(TipoDocumentoListadoComponent.name,
            `${this.deactivateTipoDocumento.name}(tipoDocumento: ${tipoDocumento})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activamos un tipo documento desactivado
   * @param tipoDocumento tipo documento
   */
  activateTipoDocumento(tipoDocumento: ITipoDocumento): void {
    this.logger.debug(TipoDocumentoListadoComponent.name,
      `${this.activateTipoDocumento.name}(tipoDocumento: ${tipoDocumento})`, 'start');

    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoDocumento.activo = true;
          return this.tipoDocumentoService.update(tipoDocumento.id, tipoDocumento);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVE);
          this.loadTable();
          this.logger.debug(TipoDocumentoListadoComponent.name,
            `${this.activateTipoDocumento.name}(tipoDocumento: ${tipoDocumento})`, 'end');
        },
        () => {
          tipoDocumento.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.debug(TipoDocumentoListadoComponent.name,
            `${this.activateTipoDocumento.name}(tipoDocumento: ${tipoDocumento})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

}


