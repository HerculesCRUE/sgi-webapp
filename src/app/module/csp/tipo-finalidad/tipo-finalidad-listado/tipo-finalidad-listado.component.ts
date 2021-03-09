import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoFinalidadService } from '@core/services/csp/tipo-finalidad.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { switchMap } from 'rxjs/operators';
import { TipoFinalidadModalComponent } from '../tipo-finalidad-modal/tipo-finalidad-modal.component';

const MSG_ERROR = marker('csp.tipo.finalidad.listado.error');
const MSG_ERROR_SAVE = marker('csp.tipo.finalidad.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.tipo.finalidad.actualizar.error');
const MSG_SAVE = marker('csp.tipo.finalidad.añadir');
const MSG_UPDATE = marker('csp.tipo.finalidad.actualizar');
const MSG_DEACTIVATE = marker('csp.tipo.finalidad.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.tipo.finalidad.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.tipo.finalidad.desactivar.error');
const MSG_REACTIVE = marker('csp.tipo.finalidad.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.tipo.finalidad.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.tipo.finalidad.reactivar.error');

@Component({
  selector: 'sgi-tipo-finalidad-listado',
  templateUrl: './tipo-finalidad-listado.component.html',
  styleUrls: ['./tipo-finalidad-listado.component.scss']
})
export class TipoFinalidadListadoComponent extends AbstractTablePaginationComponent<ITipoFinalidad> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  tiposFinalidad$: Observable<ITipoFinalidad[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoFinalidadService: TipoFinalidadService,
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

  protected createObservable(): Observable<SgiRestListResult<ITipoFinalidad>> {
    const observable$ = this.tipoFinalidadService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.tiposFinalidad$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('nombre', SgiRestFilterOperator.LIKE_ICASE, controls.nombre.value);
    if (controls.activo.value !== 'todos') {
      filter.and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value);
    }

    return filter;
  }

  onClearFilters() {
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.onSearch();
  }

  /**
   * Abre un modal para añadir o actualizar un tipo de finalidad
   *
   * @param tipoFinalidad Tipo de finalidad
   */
  openModal(tipoFinalidad?: ITipoFinalidad): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoFinalidad ? Object.assign({}, tipoFinalidad) : { activo: true } as ITipoFinalidad
    };
    const dialogRef = this.matDialog.open(TipoFinalidadModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ITipoFinalidad) => {
        if (result) {
          let subscription: Subscription;
          if (tipoFinalidad) {
            subscription = this.tipoFinalidadService.update(tipoFinalidad.id, result).subscribe(
              () => {
                this.snackBarService.showSuccess(MSG_UPDATE);
                this.loadTable();
              },
              (error) => {
                this.logger.error(error);
                this.snackBarService.showError(MSG_ERROR_UPDATE);
              }
            );
          } else {
            subscription = this.tipoFinalidadService.create(result).subscribe(
              () => {
                this.snackBarService.showSuccess(MSG_SAVE);
                this.loadTable();
              },
              (error) => {
                this.logger.error(error);
                this.snackBarService.showError(MSG_ERROR_SAVE);
              }
            );
          }
          this.suscripciones.push(subscription);
        }
      }
    );
  }

  /**
   * Desactivamos un tipo finalidad
   * @param tipoFinalidad tipo finalidad
   */
  deactivateTipoFinalidad(tipoFinalidad: ITipoFinalidad): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoFinalidadService.desactivar(tipoFinalidad.id);
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
   * Activamos un tipo finalidad desactivado
   * @param tipoFinalidad tipo finalidad
   */
  activateTipoFinalidad(tipoFinalidad: ITipoFinalidad): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoFinalidad.activo = true;
          return this.tipoFinalidadService.reactivar(tipoFinalidad.id);
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
          tipoFinalidad.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
