import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { SgiRestListResult, SgiRestFilter, SgiRestFilterType } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoOrigenFuenteFinanciacion } from '@core/models/csp/tipo-origen-fuente-financiacion';
import { TipoOrigenFuenteFinanciacionService } from '@core/services/csp/tipo-origen-fuente-financiacion.service';
import { FuenteFinanciacionModalComponent } from '../fuente-financiacion-modal/fuente-financiacion-modal.component';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { SgiAuthService } from '@sgi/framework/auth';

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
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    private readonly fuenteFinanciacionService: FuenteFinanciacionService,
    private ambitoGeograficoService: TipoAmbitoGeograficoService,
    private tipoOrigenFuenteFinanciacionService: TipoOrigenFuenteFinanciacionService,
    private matDialog: MatDialog,
    public authService: SgiAuthService,
    private readonly dialogService: DialogService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(''),
      ambitoGeografico: new FormControl(''),
      origen: new FormControl(''),
      activo: new FormControl(true)
    });
    this.filter = this.createFilters();
    this.loadAmbitosGeograficos();
    this.loadOrigenes();
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'ngOnInit()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IFuenteFinanciacion>> {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'createObservable()', 'start');
    const observable$ = this.fuenteFinanciacionService.findTodos(this.getFindOptions());
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'createObservable()', 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'initColumns()', 'start');

    let columns = ['nombre', 'descripcion', 'tipoAmbitoGeografico.nombre',
      'tipoOrigenFuenteFinanciacion.nombre', 'fondoEstructural', 'activo', 'acciones'];

    if (!this.authService.hasAuthorityForAnyUO('CSP-FF-ACT')) {
      columns = columns.filter(column => column !== 'activo');
    }

    this.columnas = columns;

    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'initColumns()', 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `loadTable(${reset})`, 'start');
    this.fuenteFinanciacion$ = this.getObservableLoadTable(reset);
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `loadTable(${reset})`, 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `${this.createFilters.name}()`, 'start');
    const filtros = [];
    this.addFiltro(filtros, 'nombre', SgiRestFilterType.LIKE, this.formGroup.controls.nombre.value);
    if (this.formGroup.controls.activo.value !== 'todos') {
      this.addFiltro(filtros, 'activo', SgiRestFilterType.EQUALS, this.formGroup.controls.activo.value);
    }
    this.addFiltro(filtros, 'tipoAmbitoGeografico.nombre', SgiRestFilterType.LIKE, this.formGroup.controls.ambitoGeografico.value.nombre);
    this.addFiltro(filtros, 'tipoOrigenFuenteFinanciacion.nombre', SgiRestFilterType.LIKE, this.formGroup.controls.origen.value.nombre);
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `${this.createFilters.name}()`, 'end');
    return filtros;
  }

  onClearFilters() {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `${this.onClearFilters.name}()`, 'start');
    this.formGroup.controls.activo.setValue(true);
    this.formGroup.controls.nombre.setValue('');
    this.formGroup.controls.ambitoGeografico.setValue('');
    this.formGroup.controls.origen.setValue('');
    this.onSearch();
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `${this.onClearFilters.name}()`, 'end');
  }

  private loadAmbitosGeograficos() {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadAmbitosGeograficos()', 'start');
    this.suscripciones.push(
      this.ambitoGeograficoService.findAll().subscribe(
        (res: SgiRestListResult<ITipoAmbitoGeografico>) => {
          this.ambitoGeograficoFiltered = res.items;
          this.ambitosGeograficos = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(

              startWith(''),
              map(value => this.filtroAmbitoGeografico(value))
            );
          this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadAmbitosGeograficos()', 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadAmbitosGeograficos()', 'end');
        }
      )
    );
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadAmbitosGeograficos()', 'end');
  }

  private loadOrigenes() {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadOrigenes()', 'start');
    this.suscripciones.push(
      this.tipoOrigenFuenteFinanciacionService.findAll().subscribe(
        (res: SgiRestListResult<ITipoOrigenFuenteFinanciacion>) => {
          this.origenFiltered = res.items;
          this.origenes = this.formGroup.controls.origen.valueChanges
            .pipe(

              startWith(''),
              map(value => this.filtroOrigen(value))
            );
          this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadOrigenes()', 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadOrigenes()', 'end');
        }
      )
    );
    this.logger.debug(FuenteFinanciacionListadoComponent.name, 'loadOrigenes()', 'end');
  }

  /**
   * Devuelve el nombre de un ámbito geográfico.
   * @param ambitoGeografico ámbito geográfico.
   * @returns nombre de un ámbito geográfico.
   */
  getAmbitoGeografico(ambitoGeografico?: ITipoAmbitoGeografico): string | undefined {
    console.log(typeof ambitoGeografico);
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
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `${this.openModal.name}(fuenteFinanciacion?: IFuenteFinanciacion)`, 'start');
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
            () => {
              this.snackBarService.showError(fuenteFinanciacion ? MSG_ERROR_UPDATE : MSG_ERROR_SAVE);
            },
            () => {
              this.logger.debug(FuenteFinanciacionModalComponent.name, `${this.openModal.name}(fuenteFinanciacion?: IFuenteFinanciacion)`, 'end');
            });
        }
      });
  }

  /**
   * Desactivar un registro de Fuente de Financiación
   * @param fuenteFinanciacion  Fuente de Financiación.
   */
  deactivateFuenteFinanciacion(fuenteFinanciacion: IFuenteFinanciacion): void {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `${this.deactivateFuenteFinanciacion.name}()`, 'start');
    this.logger.debug(FuenteFinanciacionListadoComponent.name,
      `${this.deactivateFuenteFinanciacion.name}(fuenteFinanciacion: ${fuenteFinanciacion})`, 'start');
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
          this.logger.debug(FuenteFinanciacionListadoComponent.name,
            `${this.deactivateFuenteFinanciacion.name}(fuenteFinanciacion: ${fuenteFinanciacion})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_DEACTIVATE);
          this.logger.debug(FuenteFinanciacionListadoComponent.name,
            `${this.deactivateFuenteFinanciacion.name}(fuenteFinanciacion: ${fuenteFinanciacion})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

  /**
   * Activar una Fuente de Financiación desactivada
   * @param fuenteFinanciacion  Fuente de Financiación.
   */
  activateFuenteFinanciacion(fuenteFinanciacion: IFuenteFinanciacion): void {
    this.logger.debug(FuenteFinanciacionListadoComponent.name, `${this.activateFuenteFinanciacion.name}()`, 'start');
    this.logger.debug(FuenteFinanciacionListadoComponent.name,
      `${this.activateFuenteFinanciacion.name}(fuenteFinanciacion: ${fuenteFinanciacion})`, 'start');
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
          this.logger.debug(FuenteFinanciacionListadoComponent.name,
            `${this.activateFuenteFinanciacion.name}(fuenteFinanciacion: ${fuenteFinanciacion})`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_REACTIVE);
          this.logger.debug(FuenteFinanciacionListadoComponent.name,
            `${this.activateFuenteFinanciacion.name}(fuenteFinanciacion: ${fuenteFinanciacion})`, 'end');
        }
      );
    this.suscripciones.push(subcription);
  }

}
