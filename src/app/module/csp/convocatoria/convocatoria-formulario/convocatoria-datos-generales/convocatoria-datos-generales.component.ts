import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { CLASIFICACION_CVN_MAP } from '@core/enums/clasificacion-cvn';
import { DESTINATARIOS_MAP, ESTADO_MAP, IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { ITipoRegimenConcurrencia } from '@core/models/csp/tipo-regimen-concurrencia';
import { IModeloEjecucion, ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { TipoRegimenConcurrenciaService } from '@core/services/csp/tipo-regimen-concurrencia.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaAreaTematicaModalComponent } from '../../modals/convocatoria-area-tematica-modal/convocatoria-area-tematica-modal.component';
import { AreaTematicaData, ConvocatoriaDatosGeneralesFragment } from './convocatoria-datos-generales.fragment';

const MSG_ERROR_INIT = marker('csp.convocatoria.datos.generales.error.cargar');
const MSG_DELETE = marker('csp.convocatoria.area.tematica.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-datos-generales',
  templateUrl: './convocatoria-datos-generales.component.html',
  styleUrls: ['./convocatoria-datos-generales.component.scss']
})
export class ConvocatoriaDatosGeneralesComponent extends FormFragmentComponent<IConvocatoria> implements OnInit {
  formPart: ConvocatoriaDatosGeneralesFragment;

  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesOne: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxFlexPropertiesEntidad: FxFlexProperties;

  private tipoAmbitoGeograficoFiltered = [] as ITipoAmbitoGeografico[];
  tipoAmbitosGeograficos$: Observable<ITipoAmbitoGeografico[]>;

  private finalidadFiltered = [] as ITipoFinalidad[];
  finalidades$: Observable<ITipoFinalidad[]>;

  private modelosEjecucionFiltered = [] as IModeloEjecucion[];
  modelosEjecucion$: Observable<IModeloEjecucion[]>;

  private tipoRegimenConcurrenciaFiltered = [] as ITipoRegimenConcurrencia[];
  tipoRegimenesConcurrencia$: Observable<ITipoRegimenConcurrencia[]>;

  private unidadGestionFiltered = [] as IUnidadGestion[];
  unidadesGestion$: Observable<IUnidadGestion[]>;

  private subscriptions = [] as Subscription[];

  convocatoriaAreaTematicas = new MatTableDataSource<AreaTematicaData>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  columns = ['padre', 'nombre', 'observaciones', 'acciones'];

  get DESTINATARIOS_MAP() {
    return DESTINATARIOS_MAP;
  }

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  get CLASIFICACION_CVN_MAP() {
    return CLASIFICACION_CVN_MAP;
  }

  constructor(
    private readonly logger: NGXLogger,
    protected actionService: ConvocatoriaActionService,
    private snackBarService: SnackBarService,
    private modeloEjecucionService: ModeloEjecucionService,
    private unidadGestionService: UnidadGestionService,
    private regimenConcurrenciaService: TipoRegimenConcurrenciaService,
    private tipoAmbitoGeograficoService: TipoAmbitoGeograficoService,
    private unidadModeloService: ModeloUnidadService,
    private matDialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formPart = this.fragment as ConvocatoriaDatosGeneralesFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesEntidad = new FxFlexProperties();
    this.fxFlexPropertiesEntidad.sm = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.md = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.gtMd = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.order = '3';

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(36%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '4';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit() {
    super.ngOnInit();
    if (!this.formPart.readonly) {
      this.loadUnidadesGestion();
      this.loadTipoRegimenConcurrencia();
      this.loadAmbitosGeograficos();
      this.loadAreaTematicas();
      if (this.formPart.isEdit()) {
        this.loadModelosEjecucion();
      }
    }
  }

  private loadUnidadesGestion(): void {
    this.subscriptions.push(
      this.unidadGestionService.findAllRestringidos().subscribe(
        res => {
          this.unidadGestionFiltered = res.items;
          this.unidadesGestion$ = this.formGroup.controls.unidadGestion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroUnidadGestion(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  loadModelosEjecucion(): void {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('unidadGestionRef', SgiRestFilterOperator.EQUALS, this.formGroup.controls.unidadGestion.value.acronimo)
    };
    const subcription = this.unidadModeloService.findAll(options).subscribe(
      res => {
        this.modelosEjecucionFiltered = res.items.map(item => item.modeloEjecucion);
        this.modelosEjecucion$ = this.formGroup.controls.modeloEjecucion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroModeloEjecucion(value))
          );
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT);
      }
    );
    this.subscriptions.push(subcription);
  }

  loadFinalidades(): void {
    const modeloEjecucion = this.formGroup.get('modeloEjecucion').value;
    if (modeloEjecucion) {
      const id = modeloEjecucion.id;
      if (id && !isNaN(id)) {
        const options: SgiRestFindOptions = {
          filter: new RSQLSgiRestFilter('tipoFinalidad.activo', SgiRestFilterOperator.EQUALS, 'true')
        };
        this.subscriptions.push(
          this.modeloEjecucionService.findModeloTipoFinalidad(id, options).pipe(
            map(res => {
              return res.items.map(modeloTipoFinalidad => modeloTipoFinalidad.tipoFinalidad);
            })
          ).subscribe(
            tipoFinalidades => {
              this.finalidadFiltered = tipoFinalidades;
              this.finalidades$ = this.formGroup.controls.finalidad.valueChanges
                .pipe(
                  startWith(''),
                  map(value => this.filtroFinalidades(value))
                );
            },
            (error) => {
              this.logger.error(error);
              this.snackBarService.showError(MSG_ERROR_INIT);
            }
          )
        );
      }
    }
  }

  clearModeloEjecuccion(): void {
    this.formGroup.get('modeloEjecucion').setValue('');
    this.modelosEjecucionFiltered = [];
    this.modelosEjecucion$ = of();
    this.clearFinalidad();
  }

  clearFinalidad(): void {
    this.formGroup.get('finalidad').setValue('');
    this.finalidadFiltered = [];
    this.finalidades$ = of();
  }

  private loadTipoRegimenConcurrencia(): void {
    this.subscriptions.push(
      this.regimenConcurrenciaService.findAll().subscribe(
        res => {
          this.tipoRegimenConcurrenciaFiltered = res.items;
          this.tipoRegimenesConcurrencia$ = this.formGroup.controls.regimenConcurrencia.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroRegimenConcurrencia(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  private loadAmbitosGeograficos(): void {
    this.subscriptions.push(
      this.tipoAmbitoGeograficoService.findAll().subscribe(
        res => {
          this.tipoAmbitoGeograficoFiltered = res.items;
          this.tipoAmbitosGeograficos$ = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroTipoAmbitoGeografico(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  private loadAreaTematicas(): void {
    const subscription = this.formPart.areasTematicas$.subscribe(
      data => this.convocatoriaAreaTematicas.data = data
    );
    this.subscriptions.push(subscription);
    this.convocatoriaAreaTematicas.paginator = this.paginator;
    this.convocatoriaAreaTematicas.sort = this.sort;
  }

  /**
   * Devuelve el nombre de un modelo de ejecución.
   * @param modeloEjecucion modelo de ejecución.
   * @returns nombre de un modelo de ejecución.
   */
  getModeloEjecucion(modeloEjecucion?: IModeloEjecucion): string | undefined {
    return typeof modeloEjecucion === 'string' ? modeloEjecucion : modeloEjecucion?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroModeloEjecucion(value: string): IModeloEjecucion[] {
    const filterValue = value.toString().toLowerCase();
    return this.modelosEjecucionFiltered.filter(modeloEjecucion => modeloEjecucion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre de una finalidad.
   * @param finalidad finalidad.
   * @returns nombre de una finalidad.
   */
  getFinalidad(finalidad?: ITipoFinalidad): string | undefined {
    return typeof finalidad === 'string' ? finalidad : finalidad?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroFinalidades(value: string): ITipoFinalidad[] {
    const filterValue = value.toString().toLowerCase();
    return this.finalidadFiltered.filter(finalidad => finalidad.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre de una gestión unidad.
   * @param unidadGestion gestión unidad.
   * @returns nombre de una gestión unidad.
   */
  getUnidadGestion(unidadGestion?: IUnidadGestion): string | undefined {
    return typeof unidadGestion === 'string' ? unidadGestion : unidadGestion?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroUnidadGestion(value: string | IUnidadGestion): IUnidadGestion[] {
    const filterValue = (typeof value === 'string') ? value?.toString()?.toLowerCase() : value?.nombre?.toLocaleLowerCase();
    return this.unidadGestionFiltered.filter(unidadGestion => unidadGestion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre de un régimen ocurrencia.
   * @param regimenConcurrencia régimen ocurrencia.
   * @returns nombre de un régimen ocurrencia..
   */
  getTipoRegimenConcurrencia(regimenConcurrencia?: ITipoRegimenConcurrencia): string | undefined {
    return typeof regimenConcurrencia === 'string' ? regimenConcurrencia : regimenConcurrencia?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroRegimenConcurrencia(value: string): ITipoRegimenConcurrencia[] {
    const filterValue = value?.toString()?.toLowerCase();
    return this.tipoRegimenConcurrenciaFiltered.filter(
      regimenConcurrencia => regimenConcurrencia.nombre.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Devuelve el nombre de un ámbito geográfico.
   * @param tipoAmbitoGeografico ámbito geográfico.
   * @returns nombre de un ámbito geográfico.
   */
  getTipoAmbitoGeografico(tipoAmbitoGeografico?: ITipoAmbitoGeografico): string | undefined {
    return typeof tipoAmbitoGeografico === 'string' ? tipoAmbitoGeografico : tipoAmbitoGeografico?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroTipoAmbitoGeografico(value: string): ITipoAmbitoGeografico[] {
    const filterValue = value?.toString()?.toLowerCase();
    return this.tipoAmbitoGeograficoFiltered.filter(
      ambitoGeografico => ambitoGeografico.nombre.toLowerCase().includes(filterValue)
    );
  }

  openModal(data?: AreaTematicaData): void {
    const convocatoriaAreaTematica: IConvocatoriaAreaTematica = {
      areaTematica: undefined,
      convocatoria: undefined,
      id: undefined,
      observaciones: undefined
    };
    const newData: AreaTematicaData = {
      padre: undefined,
      observaciones: '',
      convocatoriaAreaTematica: new StatusWrapper<IConvocatoriaAreaTematica>(convocatoriaAreaTematica)
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: data ? data : newData
    };
    const dialogRef = this.matDialog.open(ConvocatoriaAreaTematicaModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (result: AreaTematicaData) => {
        if (result) {
          if (data) {
            this.formPart.updateConvocatoriaAreaTematica(result);
          } else {
            this.formPart.addConvocatoriaAreaTematica(result);
          }
        }
      }
    );
  }

  deleteAreaTematica(data: AreaTematicaData): void {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteConvocatoriaAreaTematica(data);
          }
        }
      )
    );
  }
}
