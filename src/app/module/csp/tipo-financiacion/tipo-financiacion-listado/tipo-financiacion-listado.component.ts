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
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
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
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoFinanciacionService: TipoFinanciacionService,
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
      activo: new FormControl('true')
    });
    this.filter = this.createFilter();
  }

  protected createObservable(): Observable<SgiRestListResult<ITipoFinanciacion>> {
    const observable$ = this.tipoFinanciacionService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.tipoFinanciaciones$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;

    if (controls.activo.value !== 'todos') {
      return new RSQLSgiRestFilter('activo', SgiRestFilterOperator.EQUALS, controls.activo.value);
    }

    return undefined;
  }

  onClearFilters() {
    this.formGroup.controls.activo.setValue('true');
    this.onSearch();
  }

  /**
   * Abre un modal para añadir o actualizar un tipo de financiacion
   *
   * @param tipoFinanciacion Tipo de financiacion
   */
  openModal(tipoFinanciacion?: ITipoFinanciacion): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoFinanciacion ? Object.assign({}, tipoFinanciacion) : { activo: true } as ITipoFinanciacion
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
            (error) => {
              this.logger.error(error);
              this.snackBarService.showError(tipoFinanciacion ? MSG_ERROR_UPDATE : MSG_ERROR_SAVE);
            }
          );
        }
      }
    );
  }

  /**
   * Desactivar tipo financiacion
   * @param tipoFinanciacion tipo financiacion
   */
  deactivateTipoFinanciacion(tipoFinanciacion: ITipoFinanciacion): void {
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
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activamos un tipo financiacion desactivado
   * @param tipoFinanciacion tipo financiacion
   */
  activateTipoFinanciacion(tipoFinanciacion: ITipoFinanciacion): void {
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
        },
        (error) => {
          this.logger.error(error);
          tipoFinanciacion.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
