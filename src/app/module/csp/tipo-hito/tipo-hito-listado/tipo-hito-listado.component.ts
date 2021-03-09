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
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoHitoService: TipoHitoService,
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

  protected createObservable(): Observable<SgiRestListResult<ITipoHito>> {
    const observable$ = this.tipoHitoService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.tipoHitos$ = this.getObservableLoadTable(reset);
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
   * @param tipoHito Tipo de finalidad
   */
  openModal(tipoHito?: ITipoHito): void {
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
              },
              (error) => {
                this.logger.error(error);
                this.snackBarService.showError(MSG_ERROR_UPDATE);
              }
            );
          } else {
            subscription = this.tipoHitoService.create(result).subscribe(
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
   * Desactivar tipo hito
   * @param tipoDocumento tipo hito
   */
  deactivateTipoHito(tipoHito: ITipoHito): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoHitoService.desactivar(tipoHito.id);
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
   * Activamos un tipo hito desactivado
   * @param tipoHito tipo hito
   */
  activateTipoHito(tipoHito: ITipoHito): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoHito.activo = true;
          return this.tipoHitoService.reactivar(tipoHito.id);
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
          tipoHito.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
