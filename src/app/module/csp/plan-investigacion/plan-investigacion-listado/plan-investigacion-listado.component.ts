import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IPrograma } from '@core/models/csp/programa';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ProgramaService } from '@core/services/csp/programa.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiAuthService } from '@sgi/framework/auth';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const MSG_ERROR = marker('csp.plan.investigacion.listado.error');
const MSG_BUTTON_NEW = marker('footer.csp.plan.investigacion.crear');
const MSG_DEACTIVATE = marker('csp.plan.investigacion.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.plan.investigacion.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.plan.investigacion.desactivar.error');
const MSG_REACTIVE = marker('csp.plan.investigacion.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.plan.investigacion.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.plan.investigacion.reactivar.error');

@Component({
  selector: 'sgi-plan-investigacion-listado',
  templateUrl: './plan-investigacion-listado.component.html',
  styleUrls: ['./plan-investigacion-listado.component.scss']
})
export class PlanInvestigacionListadoComponent extends AbstractTablePaginationComponent<IPrograma> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;
  textoCrear = MSG_BUTTON_NEW;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  programas$: Observable<IPrograma[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly programaService: ProgramaService,
    private readonly dialogService: DialogService,
    public authService: SgiAuthService,
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

  protected createObservable(): Observable<SgiRestListResult<IPrograma>> {
    const observable$ = this.programaService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    let columns = ['nombre', 'descripcion', 'activo', 'acciones'];

    if (!this.authService.hasAuthorityForAnyUO('CSP-PI-ACT')) {
      columns = columns.filter(column => column !== 'activo');
    }

    this.columnas = columns;
  }

  protected loadTable(reset?: boolean): void {
    this.programas$ = this.getObservableLoadTable(reset);
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
   * Desactivar plan
   * @param plan plan
   */
  desactivePlan(plan: IPrograma): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.programaService.deactivate(plan.id);
        }
        return of();
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
   * Activamos un plan desactivado
   * @param plan plan
   */
  activePlan(plan: IPrograma): void {
    const suscription = this.dialogService.showConfirmation(MSG_REACTIVE).pipe(
      switchMap((accept) => {
        if (accept) {
          plan.activo = true;
          return this.programaService.activate(plan.id);
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
          plan.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(suscription);
  }

}
