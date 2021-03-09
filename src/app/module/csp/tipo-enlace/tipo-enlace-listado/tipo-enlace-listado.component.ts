import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ITipoEnlace } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoEnlaceService } from '@core/services/csp/tipo-enlace.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TipoEnlaceModalComponent } from '../tipo-enlace-modal/tipo-enlace-modal.component';

const MSG_ERROR = marker('csp.tipo.enlace.listado.error');
const MSG_ERROR_SAVE = marker('csp.tipo.enlace.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.tipo.enlace.actualizar.error');
const MSG_SAVE = marker('csp.tipo.enlace.añadir');
const MSG_UPDATE = marker('csp.tipo.enlace.actualizar');
const MSG_DEACTIVATE = marker('csp.tipo.enlace.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.tipo.enlace.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.tipo.enlace.desactivar.error');
const MSG_REACTIVE = marker('csp.tipo.enlace.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.tipo.enlace.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.tipo.enlace.reactivar.error');

@Component({
  selector: 'sgi-tipo-enlace-listado',
  templateUrl: './tipo-enlace-listado.component.html',
  styleUrls: ['./tipo-enlace-listado.component.scss']
})
export class TipoEnlaceListadoComponent extends AbstractTablePaginationComponent<ITipoEnlace> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  tipoEnlace$: Observable<ITipoEnlace[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoEnlaceService: TipoEnlaceService,
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

  protected createObservable(): Observable<SgiRestListResult<ITipoEnlace>> {
    const observable$ = this.tipoEnlaceService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.tipoEnlace$ = this.getObservableLoadTable(reset);
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
   * Abre un modal para añadir o actualizar un tipo de enlace
   *
   * @param tipoEnlace Tipo de enlace
   */
  openModal(tipoEnlace?: ITipoEnlace): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoEnlace ? Object.assign({}, tipoEnlace) : { activo: true } as ITipoEnlace
    };
    const dialogRef = this.matDialog.open(TipoEnlaceModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ITipoEnlace) => {
        if (result) {
          let subscription: Subscription;
          if (tipoEnlace) {
            subscription = this.tipoEnlaceService.update(tipoEnlace.id, result).subscribe(
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
            subscription = this.tipoEnlaceService.create(result).subscribe(
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
   * Dar de baja un registro de tipo enlace
   * @param tipoEnlace  Tipo de enlace
   */
  deactivateTipoEnlace(tipoEnlace: ITipoEnlace): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoEnlaceService.desactivar(tipoEnlace.id);
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
   * Activamos un tipo enlace desactivado
   * @param tipoEnlace tipo enlace
   */
  activateTipoEnlace(tipoEnlace: ITipoEnlace): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoEnlace.activo = true;
          return this.tipoEnlaceService.reactivar(tipoEnlace.id);
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
          tipoEnlace.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
