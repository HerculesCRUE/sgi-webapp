import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoFaseService } from '@core/services/csp/tipo-fase.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TipoFaseModalComponent } from '../tipo-fase-modal/tipo-fase-modal.component';

const MSG_ERROR = marker('csp.tipo.fase.listado.error');
const MSG_ERROR_SAVE = marker('csp.tipo.fase.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.tipo.fase.actualizar.error');
const MSG_SAVE = marker('csp.tipo.fase.añadir');
const MSG_UPDATE = marker('csp.tipo.fase.actualizar');
const MSG_DEACTIVATE = marker('csp.tipo.fase.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.tipo.fase.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.tipo.fase.desactivar.error');
const MSG_REACTIVE = marker('csp.tipo.fase.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.tipo.fase.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.tipo.fase.reactivar.error');

@Component({
  selector: 'sgi-tipo-fase-listado',
  templateUrl: './tipo-fase-listado.component.html',
  styleUrls: ['./tipo-fase-listado.component.scss']
})
export class TipoFaseListadoComponent extends AbstractTablePaginationComponent<ITipoFase> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  tiposFase$: Observable<ITipoFase[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoFaseService: TipoFaseService,
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

  protected createObservable(): Observable<SgiRestListResult<ITipoFase>> {
    const observable$ = this.tipoFaseService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.tiposFase$ = this.getObservableLoadTable(reset);
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
   * Abre un modal para añadir o actualizar un tipo de fase
   *
   * @param tipoFase tipo de fase
   */
  openModal(tipoFase?: ITipoFase): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoFase ? Object.assign({}, tipoFase) : { activo: true } as ITipoFase
    };
    const dialogRef = this.matDialog.open(TipoFaseModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ITipoFase) => {
        if (result) {
          let subscription: Subscription;
          if (tipoFase) {
            subscription = this.tipoFaseService.update(tipoFase.id, result).subscribe(
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
            subscription = this.tipoFaseService.create(result).subscribe(
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
   * Desactivamos registro de tipo fase
   * @param tipoFase tipo de fase
   */
  deactivateTipoFase(tipoFase: ITipoFase): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoFaseService.desactivar(tipoFase.id);
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
   * @param tipoFase tipo finalidad
   */
  activateTipoFase(tipoFase: ITipoFase): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoFase.activo = true;
          return this.tipoFaseService.reactivar(tipoFase.id);
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
          tipoFase.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
