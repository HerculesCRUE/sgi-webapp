import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiAuthService } from '@sgi/framework/auth';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const MSG_ERROR = marker('csp.area.tematica.listado.error');
const MSG_BUTTON_NEW = marker('footer.csp.area.tematica.crear');
const MSG_DEACTIVATE = marker('csp.area.tematica.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.area.tematica.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.area.tematica.desactivar.error');
const MSG_REACTIVE = marker('csp.area.tematica.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.area.tematica.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.area.tematica.reactivar.error');

@Component({
  selector: 'sgi-area-tematica-listado',
  templateUrl: './area-tematica-listado.component.html',
  styleUrls: ['./area-tematica-listado.component.scss']
})
export class AreaTematicaListadoComponent extends AbstractTablePaginationComponent<IAreaTematica> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;
  textoCrear = MSG_BUTTON_NEW;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  areaTematica$: Observable<IAreaTematica[]>;

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly areaTematicaService: AreaTematicaService,
    private readonly dialogService: DialogService,
    public authService: SgiAuthService,
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(AreaTematicaListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(AreaTematicaListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(AreaTematicaListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(''),
      activo: new FormControl('true')
    });
    this.filter = this.createFilters();
    this.logger.debug(AreaTematicaListadoComponent.name, 'ngOnInit()', 'end');
  }

  onClearFilters() {
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.onSearch();
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IAreaTematica>> {
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.createObservable.name}()`, 'start');
    const observable$ = this.areaTematicaService.findTodos(this.getFindOptions());
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.createObservable.name}()`, 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.initColumns.name}()`, 'start');
    let columns = ['nombre', 'descripcion', 'activo', 'acciones'];

    if (!this.authService.hasAuthorityForAnyUO('CSP-AT-ACT')) {
      columns = columns.filter(column => column !== 'activo');
    }

    this.columnas = columns;

    this.logger.debug(AreaTematicaListadoComponent.name, `${this.initColumns.name}()`, 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.loadTable.name}(${reset})`, 'start');
    this.areaTematica$ = this.getObservableLoadTable(reset);
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.loadTable.name}(${reset})`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    this.addFiltro(filtros, 'nombre', SgiRestFilterType.LIKE, this.formGroup.controls.nombre.value);
    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  /**
   * Desactivar areaTematica
   * @param areaTematica areaTematica
   */
  deactivateAreaTematica(areaTematica: IAreaTematica): void {
    this.logger.debug(AreaTematicaListadoComponent.name, `${this.deactivateAreaTematica.name}()`, 'start');
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.areaTematicaService.desactivar(areaTematica.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_DEACTIVATE);
          this.loadTable();
          this.logger.debug(AreaTematicaListadoComponent.name,
            `${this.deactivateAreaTematica.name}(areaTematica: ${areaTematica})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.error(AreaTematicaListadoComponent.name,
            `${this.deactivateAreaTematica.name}(areaTematica: ${areaTematica})`, 'error');
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activamos una areaTematica
   * @param areaTematica areaTematica
   */
  activeAreaTematica(areaTematica: IAreaTematica): void {
    this.logger.debug(AreaTematicaListadoComponent.name,
      `${this.activeAreaTematica.name}(areaTematica: ${areaTematica})`, 'start');

    const suscription = this.dialogService.showConfirmation(MSG_REACTIVE).pipe(
      switchMap((accept) => {
        if (accept) {
          areaTematica.activo = true;
          return this.areaTematicaService.reactivar(areaTematica.id);
        } else {
          return of();
        }
      })).subscribe(
        () => {
          this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVE);
          this.loadTable();
          this.logger.debug(AreaTematicaListadoComponent.name,
            `${this.activeAreaTematica.name}(areaTematica: ${areaTematica})`, 'end');
        },
        () => {
          areaTematica.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.error(AreaTematicaListadoComponent.name,
            `${this.activeAreaTematica.name}(areaTematica: ${areaTematica})`, 'error');
        }
      );
    this.suscripciones.push(suscription);
  }

}
