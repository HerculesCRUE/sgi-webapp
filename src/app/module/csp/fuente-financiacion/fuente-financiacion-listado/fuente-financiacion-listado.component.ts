import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { ITipoOrigenFuenteFinanciacion } from '@core/models/csp/tipo-origen-fuente-financiacion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { TipoOrigenFuenteFinanciacionService } from '@core/services/csp/tipo-origen-fuente-financiacion.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { SgiAuthService } from '@sgi/framework/auth';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FuenteFinanciacionModalComponent } from '../fuente-financiacion-modal/fuente-financiacion-modal.component';

const MSG_ERROR = marker('csp.fuenteFinanciacion.listado.error');
const MSG_DEACTIVATE = marker('csp.fuenteFinanciacion.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.fuenteFinanciacion.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.fuenteFinanciacion.desactivar.error');
const MSG_REACTIVE = marker('csp.fuenteFinanciacion.reactivar');
const MSG_SUCCESS_REACTIVE = marker('csp.fuenteFinanciacion.reactivar.correcto');
const MSG_ERROR_REACTIVE = marker('csp.fuenteFinanciacion.reactivar.error');
const MSG_ERROR_INIT = marker('csp.fuenteFinanciacion.datos.generales.error.cargar');
const MSG_ERROR_SAVE = marker('csp.fuenteFinanciacion.añadir.error');
const MSG_ERROR_UPDATE = marker('csp.fuenteFinanciacion.actualizar.error');
const MSG_SAVE = marker('csp.fuenteFinanciacion.añadir');
const MSG_UPDATE = marker('csp.fuenteFinanciacion.actualizar');

@Component({
  selector: 'sgi-fuente-financiacion-listado',
  templateUrl: './fuente-financiacion-listado.component.html',
  styleUrls: ['./fuente-financiacion-listado.component.scss']
})
export class FuenteFinanciacionListadoComponent extends AbstractTablePaginationComponent<IFuenteFinanciacion> implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fuenteFinanciacion$: Observable<IFuenteFinanciacion[]>;

  ambitosGeograficos: Observable<ITipoAmbitoGeografico[]>;
  origenes: Observable<ITipoOrigenFuenteFinanciacion[]>;
  private ambitoGeograficoFiltered: ITipoAmbitoGeografico[];
  private origenFiltered: ITipoOrigenFuenteFinanciacion[];

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly fuenteFinanciacionService: FuenteFinanciacionService,
    private ambitoGeograficoService: TipoAmbitoGeograficoService,
    private tipoOrigenFuenteFinanciacionService: TipoOrigenFuenteFinanciacionService,
    private matDialog: MatDialog,
    public authService: SgiAuthService,
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
      ambitoGeografico: new FormControl(''),
      origen: new FormControl(''),
      activo: new FormControl('true')
    });
    this.filter = this.createFilter();
    this.loadAmbitosGeograficos();
    this.loadOrigenes();
  }

  protected createObservable(): Observable<SgiRestListResult<IFuenteFinanciacion>> {
    const observable$ = this.fuenteFinanciacionService.findTodos(this.getFindOptions());
    return observable$;
  }

  protected initColumns(): void {
    let columns = ['nombre', 'descripcion', 'tipoAmbitoGeografico.nombre',
      'tipoOrigenFuenteFinanciacion.nombre', 'fondoEstructural', 'activo', 'acciones'];

    if (!this.authService.hasAuthorityForAnyUO('CSP-FF-ACT')) {
      columns = columns.filter(column => column !== 'activo');
    }

    this.columnas = columns;
  }

  protected loadTable(reset?: boolean): void {
    this.fuenteFinanciacion$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('nombre', SgiRestFilterOperator.LIKE_ICASE, controls.nombre.value);
    if (controls.activo.value !== 'todos') {
      filter.and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value);
    }
    filter
      .and('tipoAmbitoGeografico.nombre', SgiRestFilterOperator.LIKE_ICASE, controls.ambitoGeografico.value.nombre)
      .and('tipoOrigenFuenteFinanciacion.nombre', SgiRestFilterOperator.LIKE_ICASE, controls.origen.value.nombre);

    return filter;
  }

  onClearFilters() {
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.nombre.setValue('');
    this.formGroup.controls.ambitoGeografico.setValue('');
    this.formGroup.controls.origen.setValue('');
    this.onSearch();
  }

  private loadAmbitosGeograficos() {
    this.suscripciones.push(
      this.ambitoGeograficoService.findAll().subscribe(
        (res: SgiRestListResult<ITipoAmbitoGeografico>) => {
          this.ambitoGeograficoFiltered = res.items;
          this.ambitosGeograficos = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(

              startWith(''),
              map(value => this.filtroAmbitoGeografico(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  private loadOrigenes() {
    this.suscripciones.push(
      this.tipoOrigenFuenteFinanciacionService.findAll().subscribe(
        (res: SgiRestListResult<ITipoOrigenFuenteFinanciacion>) => {
          this.origenFiltered = res.items;
          this.origenes = this.formGroup.controls.origen.valueChanges
            .pipe(

              startWith(''),
              map(value => this.filtroOrigen(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  /**
   * Devuelve el nombre de un ámbito geográfico.
   * @param ambitoGeografico ámbito geográfico.
   * @returns nombre de un ámbito geográfico.
   */
  getAmbitoGeografico(ambitoGeografico?: ITipoAmbitoGeografico): string | undefined {
    return typeof ambitoGeografico === 'string' ? ambitoGeografico : ambitoGeografico?.nombre;
  }

  /**
   * Devuelve el nombre de un tipo de origen.
   * @param origen origen.
   * @returns nombre de un tipo de origen.
   */
  getOrigen(origen?: ITipoOrigenFuenteFinanciacion): string | undefined {
    return typeof origen === 'string' ? origen : origen?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroAmbitoGeografico(value: string): ITipoAmbitoGeografico[] {
    const filterValue = value.toString().toLowerCase();
    return this.ambitoGeograficoFiltered.filter(ambitoGeografico => ambitoGeografico.nombre.toLowerCase()
      .includes(filterValue));
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroOrigen(value: string): ITipoOrigenFuenteFinanciacion[] {
    const filterValue = value.toString().toLowerCase();
    return this.origenFiltered.filter(origen => origen.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Abre un modal para añadir o actualizar una Fuente de Financiación
   *
   * @param fuenteFinanciacion Fuente de Financiación
   */
  openModal(fuenteFinanciacion?: IFuenteFinanciacion): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: fuenteFinanciacion
    };
    const dialogRef = this.matDialog.open(FuenteFinanciacionModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: IFuenteFinanciacion) => {
        if (result) {
          const subscription = fuenteFinanciacion ? this.fuenteFinanciacionService.update(fuenteFinanciacion.id, result) :
            this.fuenteFinanciacionService.create(result);

          subscription.subscribe(
            () => {
              this.snackBarService.showSuccess(fuenteFinanciacion ? MSG_UPDATE : MSG_SAVE);
              this.loadTable();
            },
            (error) => {
              this.logger.error(error);
              this.snackBarService.showError(fuenteFinanciacion ? MSG_ERROR_UPDATE : MSG_ERROR_SAVE);
            }
          );
        }
      });
  }

  /**
   * Desactivar un registro de Fuente de Financiación
   * @param fuenteFinanciacion  Fuente de Financiación.
   */
  deactivateFuenteFinanciacion(fuenteFinanciacion: IFuenteFinanciacion): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.fuenteFinanciacionService.desactivar(fuenteFinanciacion.id);
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
   * Activar una Fuente de Financiación desactivada
   * @param fuenteFinanciacion  Fuente de Financiación.
   */
  activateFuenteFinanciacion(fuenteFinanciacion: IFuenteFinanciacion): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVE)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.fuenteFinanciacionService.reactivar(fuenteFinanciacion.id);
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
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
        }
      );
    this.suscripciones.push(subcription);
  }

}
