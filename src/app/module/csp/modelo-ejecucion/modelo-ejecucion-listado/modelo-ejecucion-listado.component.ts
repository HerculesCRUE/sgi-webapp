import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const MSG_ERROR = marker('csp.modelo.ejecucion.listado.error');
const MSG_BUTTON_NEW = marker('footer.csp.modelo.ejecucion.crear');
const MSG_DEACTIVATE = marker('csp.modelo.ejecucion.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.modelo.ejecucion.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.modelo.ejecucion.desactivar.error');
const MSG_REACTIVE = marker('csp.modelo.ejecucion.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.modelo.ejecucion.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.modelo.ejecucion.reactivar.error');

@Component({
  selector: 'sgi-modelo-ejecucion-listado',
  templateUrl: './modelo-ejecucion-listado.component.html',
  styleUrls: ['./modelo-ejecucion-listado.component.scss']
})
export class ModeloEjecucionListadoComponent extends AbstractTablePaginationComponent<IModeloEjecucion> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;
  textoCrear = MSG_BUTTON_NEW;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  modeloEjecucion$: Observable<IModeloEjecucion[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly modeloEjecucionService: ModeloEjecucionService,
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

  protected createObservable(): Observable<SgiRestListResult<IModeloEjecucion>> {
    const observable$ = this.modeloEjecucionService.findAllTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.modeloEjecucion$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('nombre', SgiRestFilterOperator.LIKE_ICASE, controls.nombre.value);
    if (controls.activo.value !== 'todos') {
      filter.and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value);
    }

    return filter;
  }

  /**
   * Desactivamos un modelo ejecucion activado
   * @param modeloEjecucion modelo ejecucion
   */
  deactivateModeloEjecucion(modeloEjecucion: IModeloEjecucion): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.modeloEjecucionService.desactivar(modeloEjecucion.id);
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
   * Activamos un modelo ejecucion desactivado
   * @param tipoDocumento modelo ejecucion
   */
  activateModeloEjecucion(modeloEjecucion: IModeloEjecucion): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          modeloEjecucion.activo = true;
          return this.modeloEjecucionService.reactivar(modeloEjecucion.id);
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
          modeloEjecucion.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
