import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ITipoDocumento } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { TipoDocumentoService } from '@core/services/csp/tipo-documento.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TipoDocumentoModalComponent } from '../tipo-documento-modal/tipo-documento-modal.component';

const MSG_ERROR = marker('csp.tipo.documento.listado.error');
const MSG_ERROR_SAVE = marker('csp.tipo.documento.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.tipo.documento.actualizar.error');
const MSG_SAVE = marker('csp.tipo.documento.añadir');
const MSG_UPDATE = marker('csp.tipo.documento.actualizar');
const MSG_DEACTIVATE = marker('csp.tipo.documento.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.tipo.documento.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.tipo.documento.desactivar.error');
const MSG_REACTIVE = marker('csp.tipo.documento.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.tipo.documento.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.tipo.documento.reactivar.error');

@Component({
  selector: 'sgi-tipo-documento-listado',
  templateUrl: './tipo-documento-listado.component.html',
  styleUrls: ['./tipo-documento-listado.component.scss']
})
export class TipoDocumentoListadoComponent extends AbstractTablePaginationComponent<ITipoDocumento> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  tiposDocumento$: Observable<ITipoDocumento[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly tipoDocumentoService: TipoDocumentoService,
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

  protected createObservable(): Observable<SgiRestListResult<ITipoDocumento>> {
    const observable$ = this.tipoDocumentoService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.tiposDocumento$ = this.getObservableLoadTable(reset);
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
   * Abre un modal para añadir o actualizar
   *
   * @param tipoDocumento Tipo de documento
   */
  openModal(tipoDocumento?: ITipoDocumento): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: tipoDocumento ? Object.assign({}, tipoDocumento) : { activo: true } as ITipoDocumento
    };
    const dialogRef = this.matDialog.open(TipoDocumentoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: ITipoDocumento) => {
        if (result) {
          let subscription: Subscription;
          if (tipoDocumento) {
            subscription = this.tipoDocumentoService.update(tipoDocumento.id, result).subscribe(
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
            subscription = this.tipoDocumentoService.create(result).subscribe(
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
   * Desactivar tipo documento
   * @param tipoDocumento tipo documento
   */
  deactivateTipoDocumento(tipoDocumento: ITipoDocumento): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.tipoDocumentoService.desactivar(tipoDocumento.id);
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
   * Activamos un tipo documento desactivado
   * @param tipoDocumento tipo documento
   */
  activateTipoDocumento(tipoDocumento: ITipoDocumento): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          tipoDocumento.activo = true;
          return this.tipoDocumentoService.reactivar(tipoDocumento.id);
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
          tipoDocumento.activo = false;
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
