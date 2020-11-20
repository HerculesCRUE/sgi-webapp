import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { NGXLogger } from 'ngx-logger';
import { SnackBarService } from '@core/services/snack-bar.service';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { Observable, Subscription, BehaviorSubject, of } from 'rxjs';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { startWith, map } from 'rxjs/operators';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { ITipoRegimenConcurrencia } from '@core/models/csp/tipo-regimen-concurrencia';
import { TipoRegimenConcurrenciaService } from '@core/services/csp/tipo-regimen-concurrencia.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { AreaTematicaData, ConvocatoriaDatosGeneralesFragment } from './convocatoria-datos-generales.fragment';
import { IModeloEjecucion, ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { MatDialog } from '@angular/material/dialog';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { SgiRestFilter, SgiRestFilterType, SgiRestFindOptions } from '@sgi/framework/http';
import { TipoDestinatario } from '@core/enums/tipo-destinatario';
import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { ConvocatoriaAreaTematicaModalComponent } from '../../modals/convocatoria-area-tematica-modal/convocatoria-area-tematica-modal.component';
import { DialogService } from '@core/services/dialog.service';

const MSG_ERROR_INIT = marker('csp.convocatoria.datos.generales.error.cargar');
const LABEL_BUSCADOR_EMPRESAS_ECONOMICAS = marker('csp.convocatoria.entidad.gestora');
const MSG_DELETE = marker('csp.convocatoria.area.tematica.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-datos-generales',
  templateUrl: './convocatoria-datos-generales.component.html',
  styleUrls: ['./convocatoria-datos-generales.component.scss']
})
export class ConvocatoriaDatosGeneralesComponent extends FormFragmentComponent<IConvocatoria> implements OnInit {
  formPart: ConvocatoriaDatosGeneralesFragment;
  label = LABEL_BUSCADOR_EMPRESAS_ECONOMICAS;

  areasTematicas$: BehaviorSubject<StatusWrapper<IAreaTematica>[]>;

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
  numPage = [5, 10, 25, 50];

  clasificacionesProduccion = Object.keys(ClasificacionCVN).map<string>((key) => ClasificacionCVN[key]);
  destinatarios = Object.keys(TipoDestinatario).map<string>((key) => TipoDestinatario[key]);

  constructor(
    protected logger: NGXLogger,
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
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, 'constructor()', 'start');
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

    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.loadUnidadesGestion();
    this.loadTipoRegimenConcurrencia();
    this.loadAmbitosGeograficos();
    this.loadAreaTematicas();

    if (this.formGroup.controls.unidadGestion.value) {
      this.loadModelosEjecucion();
    }
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, 'ngOnInit()', 'end');
  }

  private loadUnidadesGestion() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadUnidadesGestion()`, 'start');
    this.subscriptions.push(
      this.unidadGestionService.findAllRestringidos().subscribe(
        res => {
          this.unidadGestionFiltered = res.items;
          this.unidadesGestion$ = this.formGroup.controls.unidadGestion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroUnidadGestion(value))
            );
          this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadUnidadesGestion()`, 'end');
        },
        (error) => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.error(ConvocatoriaDatosGeneralesComponent.name, `loadUnidadesGestion()`, error);
        }
      )
    );
  }

  loadModelosEjecucion() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadModelosEjecucion()`, 'start');
    const options = {
      filters: [
        {
          field: 'unidadGestionRef',
          type: SgiRestFilterType.EQUALS,
          value: this.formGroup.controls.unidadGestion.value.acronimo,
        } as SgiRestFilter,
        {
          field: 'modeloEjecucion.activo',
          type: SgiRestFilterType.EQUALS,
          value: 'true',
        } as SgiRestFilter
      ]
    } as SgiRestFindOptions;
    const subcription = this.unidadModeloService.findAll(options).subscribe(
      res => {
        this.modelosEjecucionFiltered = res.items.map(item => item.modeloEjecucion);
        this.modelosEjecucion$ = this.formGroup.controls.modeloEjecucion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroModeloEjecucion(value))
          );
        this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadModelosEjecucion()`, 'end');
      },
      (error) => {
        this.snackBarService.showError(MSG_ERROR_INIT);
        this.logger.error(ConvocatoriaDatosGeneralesComponent.name, `loadModelosEjecucion()`, error);
      }
    );
    this.subscriptions.push(subcription);
  }

  loadFinalidades() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadFinalidades()`, 'start');
    const modeloEjecucion = this.formGroup.get('modeloEjecucion').value;
    if (modeloEjecucion) {
      const id = modeloEjecucion.id;
      if (id && !isNaN(id)) {
        const options = {
          filters: [
            {
              field: 'tipoFinalidad.activo',
              type: SgiRestFilterType.EQUALS,
              value: 'true',
            } as SgiRestFilter
          ]
        } as SgiRestFindOptions;
        this.subscriptions.push(
          this.modeloEjecucionService.findModeloTipoFinalidad(id, options).pipe(
            map(res => {
              const tipoFinalidades = res.items.map(modeloTipoFinalidad => modeloTipoFinalidad.tipoFinalidad);
              return tipoFinalidades;
            })
          ).subscribe(
            tipoFinalidades => {
              this.finalidadFiltered = tipoFinalidades;
              this.finalidades$ = this.formGroup.controls.finalidad.valueChanges
                .pipe(
                  startWith(''),
                  map(value => this.filtroFinalidades(value))
                );
              this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadFinalidades()`, 'end');
            },
            (error) => {
              this.snackBarService.showError(MSG_ERROR_INIT);
              this.logger.error(ConvocatoriaDatosGeneralesComponent.name, `loadFinalidades()`, error);
            }
          )
        );
      }
    }
  }

  clearModeloEjecuccion() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `clearModeloEjecuccion()`, 'end');
    this.formGroup.get('modeloEjecucion').setValue('');
    this.modelosEjecucionFiltered = [];
    this.modelosEjecucion$ = of();
    this.clearFinalidad();
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `clearModeloEjecuccion()`, 'end');
  }

  clearFinalidad() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `clearFinalidad()`, 'end');
    this.formGroup.get('finalidad').setValue('');
    this.finalidadFiltered = [];
    this.finalidades$ = of();
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `clearFinalidad()`, 'end');
  }

  private loadTipoRegimenConcurrencia() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadTipoRegimenConcurrencia()`, 'start');
    this.subscriptions.push(
      this.regimenConcurrenciaService.findAll().subscribe(
        res => {
          this.tipoRegimenConcurrenciaFiltered = res.items;
          this.tipoRegimenesConcurrencia$ = this.formGroup.controls.regimenConcurrencia.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroRegimenConcurrencia(value))
            );
          this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadTipoRegimenConcurrencia()`, 'end');
        },
        (error) => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.error(ConvocatoriaDatosGeneralesComponent.name, `loadTipoRegimenConcurrencia()`, error);
        }
      )
    );
  }

  private loadAmbitosGeograficos() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadAmbitosGeograficos()`, 'start');
    this.subscriptions.push(
      this.tipoAmbitoGeograficoService.findAll().subscribe(
        res => {
          this.tipoAmbitoGeograficoFiltered = res.items;
          this.tipoAmbitosGeograficos$ = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroTipoAmbitoGeografico(value))
            );
          this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadAmbitosGeograficos()`, 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.error(ConvocatoriaDatosGeneralesComponent.name, `loadAmbitosGeograficos()`, 'error');
        }
      )
    );
  }

  private loadAreaTematicas() {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadAreaTematicas()`, 'start');
    const subscription = this.formPart.areasTematicas$.subscribe(
      data => this.convocatoriaAreaTematicas.data = data
    );
    this.subscriptions.push(subscription);
    this.convocatoriaAreaTematicas.paginator = this.paginator;
    this.convocatoriaAreaTematicas.sort = this.sort;
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `loadAreaTematicas()`, 'end');
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
  private filtroUnidadGestion(value: string): IUnidadGestion[] {
    const filterValue = value.toString().toLowerCase();
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
    const filterValue = value.toString().toLowerCase();
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
    const filterValue = value.toString().toLowerCase();
    return this.tipoAmbitoGeograficoFiltered.filter(
      ambitoGeografico => ambitoGeografico.nombre.toLowerCase().includes(filterValue)
    );
  }

  openModal(data?: AreaTematicaData): void {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `openModal()`, 'start');
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
        this.logger.debug(ConvocatoriaDatosGeneralesComponent.name, `openModal()`, 'end');
      }
    );
  }

  deleteAreaTematica(data: AreaTematicaData) {
    this.logger.debug(ConvocatoriaDatosGeneralesComponent.name,
      `deleteAreaTematica(${data})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteConvocatoriaAreaTematica(data);
          }
          this.logger.debug(ConvocatoriaDatosGeneralesComponent.name,
            `deleteAreaTematica(${data})`, 'end');
        }
      )
    );
  }
}
