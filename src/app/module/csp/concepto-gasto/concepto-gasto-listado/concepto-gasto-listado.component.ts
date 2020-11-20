import { Component, OnInit } from '@angular/core';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { Observable } from 'rxjs/internal/Observable';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DialogService } from '@core/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { IConceptoGasto } from '@core/models/csp/tipos-configuracion';
import { ConceptoGastoService } from '@core/services/csp/concepto-gasto.service';
import { FormControl, FormGroup } from '@angular/forms';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { ConceptoGastoModalComponent } from '../concepto-gasto-modal/concepto-gasto-modal.component';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs/internal/observable/of';

const MSG_ERROR = marker('csp.gestion.concepto.gasto.listado.error');
const MSG_SAVE = marker('csp.concepto.gasto.añadir');
const MSG_UPDATE = marker('csp.concepto.gasto.actualizar');
const MSG_ERROR_SAVE = marker('csp.concepto.gasto.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.concepto.gasto.actualizar.error');
const MSG_REACTIVE = marker('csp.concepto.gasto.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.concepto.gasto.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.concepto.gasto.reactivar.error');
const MSG_DEACTIVATE = marker('csp.concepto.gasto.desactivar');
const MSG_ERROR_DEACTIVATE = marker('csp.concepto.gasto.desactivar.error');
const MSG_SUCCESS_DEACTIVATE = marker('csp.concepto.gasto.desactivar.correcto');

@Component({
  selector: 'sgi-concepto-gasto-listado',
  templateUrl: './concepto-gasto-listado.component.html',
  styleUrls: ['./concepto-gasto-listado.component.scss']
})
export class ConceptoGastoListadoComponent extends AbstractTablePaginationComponent<IConceptoGasto> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  conceptosGasto$: Observable<IConceptoGasto[]>;


  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly conceptoGastoService: ConceptoGastoService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(ConceptoGastoListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(ConceptoGastoListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConceptoGastoListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(''),
      activo: new FormControl('true')
    });
    this.filter = this.createFilters();
    this.logger.debug(ConceptoGastoListadoComponent.name, 'ngOnInit()', 'end');
  }

  onClearFilters() {
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.onSearch();
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  protected initColumns(): void {
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.initColumns.name}()`, 'start');
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.initColumns.name}()`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    this.addFiltro(filtros, 'nombre', SgiRestFilterType.LIKE, this.formGroup.controls.nombre.value);
    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  protected createObservable(): Observable<SgiRestListResult<any>> {
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.createObservable.name}()`, 'start');
    const observable$ = this.conceptoGastoService.findTodos(this.getFindOptions());
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.createObservable.name}()`, 'end');
    return observable$;
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.loadTable.name}(${reset})`, 'start');
    this.conceptosGasto$ = this.getObservableLoadTable(reset);
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.loadTable.name}(${reset})`, 'end');
  }


  /**
   * Abre un modal para añadir o actualizar
   *
   * @param conceptoGasto Concepto Gasto
   */
  openModal(conceptoGasto?: IConceptoGasto): void {
    this.logger.debug(ConceptoGastoListadoComponent.name, `${this.openModal.name}(conceptoGasto: ${conceptoGasto})`, 'start');
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: conceptoGasto
    };
    const dialogRef = this.matDialog.open(ConceptoGastoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: IConceptoGasto) => {
        if (result) {
          const subscription = conceptoGasto ? this.conceptoGastoService.update(conceptoGasto.id, result) :
            this.conceptoGastoService.create(result);

          subscription.subscribe(
            () => {
              this.snackBarService.showSuccess(conceptoGasto ? MSG_UPDATE : MSG_SAVE);
              this.loadTable();
            },
            () => {
              this.snackBarService.showError(conceptoGasto ? MSG_ERROR_UPDATE : MSG_ERROR_SAVE);
            },
            () => {
              this.logger.error(ConceptoGastoListadoComponent.name,
                `${this.openModal.name}(conceptoGasto: ${conceptoGasto})`, 'error');
            }
          );

        }
      }
    );
  }

  deactivateConceptoGasto(conceptoGasto: IConceptoGasto): void {
    this.logger.debug(ConceptoGastoListadoComponent.name,
      `${this.deactivateConceptoGasto.name}(conceptoGasto: ${conceptoGasto})`, 'start');
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.conceptoGastoService.desactivar(conceptoGasto.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_DEACTIVATE);
          this.loadTable();
          this.logger.debug(ConceptoGastoListadoComponent.name,
            `${this.deactivateConceptoGasto.name}(conceptoGasto: ${conceptoGasto})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.debug(ConceptoGastoListadoComponent.name,
            `${this.deactivateConceptoGasto.name}(conceptoGasto: ${conceptoGasto})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

  activateConceptoGasto(conceptoGasto: IConceptoGasto): void {
    this.logger.debug(ConceptoGastoListadoComponent.name,
      `${this.activateConceptoGasto.name}(conceptoGasto: ${conceptoGasto})`, 'start');

    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.conceptoGastoService.reactivar(conceptoGasto.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVE);
          this.loadTable();
          this.logger.debug(ConceptoGastoListadoComponent.name,
            `${this.activateConceptoGasto.name}(conceptoGasto: ${conceptoGasto})`, 'end');
        },
        () => {
          conceptoGasto.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.debug(ConceptoGastoListadoComponent.name,
            `${this.activateConceptoGasto.name}(conceptoGasto: ${conceptoGasto})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }
}
