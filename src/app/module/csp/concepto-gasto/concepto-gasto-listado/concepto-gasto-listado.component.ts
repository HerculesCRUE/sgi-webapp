import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IConceptoGasto } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConceptoGastoService } from '@core/services/csp/concepto-gasto.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConceptoGastoModalComponent } from '../concepto-gasto-modal/concepto-gasto-modal.component';

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
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly conceptoGastoService: ConceptoGastoService,
    private matDialog: MatDialog,
    private readonly dialogService: DialogService
  ) {
    super(snackBarService, MSG_ERROR);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(''),
      activo: new FormControl('true')
    });
    this.filter = this.createFilter();
  }

  onClearFilters() {
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.onSearch();
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('nombre', SgiRestFilterOperator.LIKE_ICASE, controls.nombre.value);

    if (controls.activo.value !== 'todos') {
      filter.and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value);
    }

    return filter;
  }

  protected createObservable(): Observable<SgiRestListResult<any>> {
    const observable$ = this.conceptoGastoService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected loadTable(reset?: boolean): void {
    this.conceptosGasto$ = this.getObservableLoadTable(reset);
  }


  /**
   * Abre un modal para añadir o actualizar
   *
   * @param conceptoGasto Concepto Gasto
   */
  openModal(conceptoGasto?: IConceptoGasto): void {
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
            (error) => {
              this.logger.error(error);
              this.snackBarService.showError(conceptoGasto ? MSG_ERROR_UPDATE : MSG_ERROR_SAVE);
            }
          );

        }
      }
    );
  }

  deactivateConceptoGasto(conceptoGasto: IConceptoGasto): void {
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
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
        }
      );
    this.suscripciones.push(subcription);
  }

  activateConceptoGasto(conceptoGasto: IConceptoGasto): void {
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
        },
        (error) => {
          conceptoGasto.activo = false;
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }
}
