import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestListResult, SgiRestFilter, SgiRestFilterType } from '@sgi/framework/http';
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
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly modeloEjecucionService: ModeloEjecucionService,
    private readonly dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(ModeloEjecucionListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(ModeloEjecucionListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ModeloEjecucionListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(''),
      activo: new FormControl('true')
    });
    this.filter = this.createFilters();
    this.logger.debug(ModeloEjecucionListadoComponent.name, 'ngOnInit()', 'end');
  }

  onClearFilters() {
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.onSearch();
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IModeloEjecucion>> {
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.createObservable.name}()`, 'start');
    const observable$ = this.modeloEjecucionService.findTodos(this.getFindOptions());
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.createObservable.name}()`, 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.initColumns.name}()`, 'start');
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.initColumns.name}()`, 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.loadTable.name}(${reset})`, 'start');
    this.modeloEjecucion$ = this.getObservableLoadTable(reset);
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.loadTable.name}(${reset})`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    this.addFiltro(filtros, 'nombre', SgiRestFilterType.LIKE, this.formGroup.controls.nombre.value);
    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  /**
   * Desactivamos un modelo ejecucion activado
   * @param modeloEjecucion modelo ejecucion
   */
  deactivateModeloEjecucion(modeloEjecucion: IModeloEjecucion): void {
    this.logger.debug(ModeloEjecucionListadoComponent.name, `${this.deactivateModeloEjecucion.name}()`, 'start');
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.modeloEjecucionService.deleteById(modeloEjecucion.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_DEACTIVATE);
          this.loadTable();
          this.logger.debug(ModeloEjecucionListadoComponent.name,
            `${this.deactivateModeloEjecucion.name}(modeloEjecucion: ${modeloEjecucion})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.debug(ModeloEjecucionListadoComponent.name,
            `${this.deactivateModeloEjecucion.name}(modeloEjecucion: ${modeloEjecucion})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }


  /**
   * Activamos un modelo ejecucion desactivado
   * @param tipoDocumento modelo ejecucion
   */
  activateModeloEjecucion(modeloEjecucion: IModeloEjecucion): void {
    this.logger.debug(ModeloEjecucionListadoComponent.name,
      `${this.activateModeloEjecucion.name}(modeloEjecucion: ${modeloEjecucion})`, 'start');

    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          modeloEjecucion.activo = true;
          return this.modeloEjecucionService.update(modeloEjecucion.id, modeloEjecucion);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVE);
          this.loadTable();
          this.logger.debug(ModeloEjecucionListadoComponent.name,
            `${this.activateModeloEjecucion.name}(modeloEjecucion: ${modeloEjecucion})`, 'end');
        },
        () => {
          modeloEjecucion.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.debug(ModeloEjecucionListadoComponent.name,
            `${this.activateModeloEjecucion.name}(modeloEjecucion: ${modeloEjecucion})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

}
