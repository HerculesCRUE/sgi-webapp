import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { ESTADO_MAP } from '@core/models/csp/estado-solicitud';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { IPrograma } from '@core/models/csp/programa';
import { IProyecto } from '@core/models/csp/proyecto';
import { ISolicitud } from '@core/models/csp/solicitud';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { ProgramaService } from '@core/services/csp/programa.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { DialogService } from '@core/services/dialog.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ISolicitudCrearProyectoModalData, SolicitudCrearProyectoModalComponent } from '../modals/solicitud-crear-proyecto-modal/solicitud-crear-proyecto-modal.component';

const MSG_BUTTON_NEW = marker('footer.csp.solicitud.crear');
const MSG_ERROR = marker('csp.solicitud.listado.error');
const MSG_DEACTIVATE = marker('csp.solicitud.listado.desactivar');
const MSG_SUCCESS_DEACTIVATE = marker('csp.solicitud.listado.desactivar.correcto');
const MSG_ERROR_DEACTIVATE = marker('csp.solicitud.listado.desactivar.error');
const MSG_REACTIVATE = marker('csp.solicitud.listado.reactivar');
const MSG_SUCCESS_REACTIVATE = marker('csp.solicitud.listado.reactivar.correcto');
const MSG_ERROR_REACTIVATE = marker('csp.solicitud.listado.reactivar.error');
const MSG_ERROR_FUENTE_FINANCIACION_INIT = marker('csp.solicitud.listado.fuente.financiacion.error');
const MSG_ERROR_PLAN_INVESTIGACION_INIT = marker('csp.solicitud.listado.plan.investigacion.error');
const MSG_SUCCESS_CREAR_PROYECTO = marker('csp.solicitud.listado.crear.proyecto.correcto');
const MSG_ERROR_CREAR_PROYECTO = marker('csp.solicitud.listado.crear.proyecto.error');

@Component({
  selector: 'sgi-solicitud-listado',
  templateUrl: './solicitud-listado.component.html',
  styleUrls: ['./solicitud-listado.component.scss']
})
export class SolicitudListadoComponent extends AbstractTablePaginationComponent<ISolicitud> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;


  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  solicitudes$: Observable<ISolicitud[]>;
  textoCrear = MSG_BUTTON_NEW;


  busquedaAvanzada = false;
  private fuenteFinanciacionFiltered: IFuenteFinanciacion[] = [];
  fuenteFinanciacion$: Observable<IFuenteFinanciacion[]>;
  private planInvestigacionFiltered: IPrograma[] = [];
  planInvestigaciones$: Observable<IPrograma[]>;

  mapCrearProyecto: Map<number, boolean> = new Map();
  mapModificable: Map<number, boolean> = new Map();

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  constructor(
    private readonly logger: NGXLogger,
    private dialogService: DialogService,
    protected snackBarService: SnackBarService,
    private solicitudService: SolicitudService,
    private personaFisicaService: PersonaFisicaService,
    private fuenteFinanciacionService: FuenteFinanciacionService,
    private programaService: ProgramaService,
    private proyectoService: ProyectoService,
    private matDialog: MatDialog,
  ) {
    super(snackBarService, MSG_ERROR);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(17%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup = new FormGroup({
      referenciaConvocatoria: new FormControl(''),
      estadoSolicitud: new FormControl(''),

      plazoAbierto: new FormControl(false),
      fechaInicioDesde: new FormControl(undefined),
      fechaInicioHasta: new FormControl(undefined),
      fechaFinDesde: new FormControl(undefined),
      fechaFinHasta: new FormControl(undefined),
      solicitante: new FormControl(undefined),
      activo: new FormControl('true'),
      añoConvocatoria: new FormControl(undefined),
      tituloConvocatoria: new FormControl(undefined),
      entidadConvocante: new FormControl(undefined),
      planInvestigacion: new FormControl(undefined),
      entidadFinanciadora: new FormControl(undefined),
      fuenteFinanciacion: new FormControl(undefined)
    });

    this.getFuentesFinanciacion();
    this.getPlanesInvestigacion();
  }

  protected createObservable(): Observable<SgiRestListResult<ISolicitud>> {
    const observable$ = this.solicitudService.findAllTodos(this.getFindOptions()).pipe(
      switchMap((response) => {
        if (response.total === 0) {
          return of(response);
        }

        const solicitudes = response.items;
        const personaRefsSolicitantes = solicitudes.map((solicitud) => solicitud.solicitante.personaRef);
        const solicitudesWithDatosSolicitante$ = this.personaFisicaService.findByPersonasRefs([...personaRefsSolicitantes]).pipe(
          map((result) => {
            const personas = result.items;

            solicitudes.forEach((solicitud) => {
              this.suscripciones.push(this.solicitudService.isPosibleCrearProyecto(solicitud.id).subscribe((value) => {
                this.mapCrearProyecto.set(solicitud.id, value);
              }));
              solicitud.solicitante = personas.find((persona) =>
                solicitud.solicitante.personaRef === persona.personaRef);

              this.suscripciones.push(this.solicitudService.modificable(solicitud.id).subscribe((value) => {
                this.mapModificable.set(solicitud.id, value);
              }));
            });

            return response;
          }),
          catchError(() => of(response))
        );

        return solicitudesWithDatosSolicitante$;
      })
    );

    return observable$;
  }

  protected initColumns(): void {
    this.columnas = [
      'referencia',
      'convocatoria.titulo',
      'codigoRegistroInterno',
      'solicitante',
      'estado.estado',
      'estado.fechaEstado',
      'activo',
      'acciones'
    ];
  }

  protected loadTable(reset?: boolean): void {
    this.solicitudes$ = this.getObservableLoadTable(reset);
  }

  protected createFilter(): SgiRestFilter {
    const controls = this.formGroup.controls;
    const filter = new RSQLSgiRestFilter('referenciaConvocatoria', SgiRestFilterOperator.LIKE_ICASE, controls.referenciaConvocatoria.value)
      .and('estado.estado', SgiRestFilterOperator.EQUALS, controls.estadoSolicitud.value);
    if (this.busquedaAvanzada) {
      if (controls.plazoAbierto.value) {
        // TODO: Fix when dateTime are right managed
        if (controls.fechaInicioDesde.value) {
          filter.and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaInicio',
            SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaInicioDesde.value) + 'T00:00:00');
        }
        if (controls.fechaInicioHasta.value) {
          filter.and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaInicio',
            SgiRestFilterOperator.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaInicioHasta.value) + 'T23:59:59');
        }
        if (controls.fechaFinDesde.value) {
          filter.and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaFin',
            SgiRestFilterOperator.GREATHER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaFinDesde.value) + 'T00:00:00');
        }
        if (controls.fechaFinHasta.value) {
          filter.and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaFin',
            SgiRestFilterOperator.LOWER_OR_EQUAL, DateUtils.formatFechaAsISODate(controls.fechaFinHasta.value) + 'T23:59:59');
        }
      }
      filter
        .and('solicitanteRef', SgiRestFilterOperator.EQUALS, controls.solicitante.value?.personaRef)
        .and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value)
        .and('convocatoria.anio', SgiRestFilterOperator.EQUALS, controls.añoConvocatoria.value)
        .and('convocatoria.titulo', SgiRestFilterOperator.LIKE_ICASE, controls.tituloConvocatoria.value)
        .and('convocatoria.entidadesConvocantes.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadConvocante.value?.personaRef)
        .and('convocatoria.entidadesConvocantes.programa.id', SgiRestFilterOperator.EQUALS, controls.planInvestigacion.value?.id?.toString())
        .and('convocatoria.entidadesFinanciadoras.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadFinanciadora.value?.personaRef)
        .and('convocatoria.entidadesFinanciadoras.fuenteFinanciacion.id', SgiRestFilterOperator.EQUALS, controls.fuenteFinanciacion.value?.id?.toString());
    }

    return filter;
  }

  /**
   * Activar solicitud
   * @param solicitud una solicitud
   */
  activateSolicitud(solicitud: ISolicitud): void {
    const subcription = this.dialogService.showConfirmation(MSG_REACTIVATE).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.solicitudService.reactivar(solicitud.id);
        } else {
          return of();
        }
      })
    ).subscribe(
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS_REACTIVATE);
        this.loadTable();
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_REACTIVATE);
      }
    );
    this.suscripciones.push(subcription);
  }

  /**
   * Desactivar solicitud
   * @param solicitud una solicitud
   */
  deactivateSolicitud(solicitud: ISolicitud): void {
    const subcription = this.dialogService.showConfirmation(MSG_DEACTIVATE).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.solicitudService.desactivar(solicitud.id);
        } else {
          return of();
        }
      })
    ).subscribe(
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

  toggleBusquedaAvanzada(): void {
    this.busquedaAvanzada = !this.busquedaAvanzada;
    this.cleanBusquedaAvanzado();
  }

  onClearFilters(): void {
    super.onClearFilters();
    this.cleanBusquedaAvanzado();
  }

  private cleanBusquedaAvanzado(): void {
    this.formGroup.controls.plazoAbierto.setValue(false);
    this.formGroup.controls.fechaInicioDesde.setValue(undefined);
    this.formGroup.controls.fechaInicioHasta.setValue(undefined);
    this.formGroup.controls.fechaFinDesde.setValue(undefined);
    this.formGroup.controls.fechaFinHasta.setValue(undefined);
    this.formGroup.controls.solicitante.setValue(undefined);
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.añoConvocatoria.setValue(undefined);
    this.formGroup.controls.entidadConvocante.setValue(undefined);
    this.formGroup.controls.entidadFinanciadora.setValue(undefined);
  }

  private getFuentesFinanciacion(): void {
    this.suscripciones.push(
      this.fuenteFinanciacionService.findAll().subscribe(
        (res) => {
          this.fuenteFinanciacionFiltered = res.items;
          this.fuenteFinanciacion$ = this.formGroup.controls.fuenteFinanciacion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroFuenteFinanciacion(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_FUENTE_FINANCIACION_INIT);
        }
      )
    );
  }

  private filtroFuenteFinanciacion(value: string): IFuenteFinanciacion[] {
    const filterValue = value?.toString().toLowerCase();
    return this.fuenteFinanciacionFiltered.filter(fuente => fuente.nombre.toLowerCase().includes(filterValue));
  }

  getFuenteFinanciacion(fuente?: IFuenteFinanciacion): string | undefined {
    return typeof fuente === 'string' ? fuente : fuente?.nombre;
  }

  private getPlanesInvestigacion(): void {
    this.suscripciones.push(
      this.programaService.findAllPlan().subscribe(
        (res) => {
          this.planInvestigacionFiltered = res.items;
          this.planInvestigaciones$ = this.formGroup.controls.planInvestigacion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroPlanInvestigacion(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_PLAN_INVESTIGACION_INIT);
        }
      )
    );
  }

  private filtroPlanInvestigacion(value: string): IPrograma[] {
    const filterValue = value?.toString().toLowerCase();
    return this.planInvestigacionFiltered.filter(fuente => fuente.nombre.toLowerCase().includes(filterValue));
  }

  getPlanInvestigacion(programa?: IPrograma): string | undefined {
    return typeof programa === 'string' ? programa : programa?.nombre;
  }

  crearProyectoModal(solicitud: ISolicitud): void {
    const proyecto = { solicitud } as IProyecto;
    this.suscripciones.push(this.solicitudService.findSolicitudProyectoDatos(solicitud.id).pipe(
      map(solicitudProyectoDatos => {
        const config = {
          width: GLOBAL_CONSTANTS.widthModalCSP,
          maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
          data: { proyecto, solicitudProyectoDatos } as ISolicitudCrearProyectoModalData
        };
        const dialogRef = this.matDialog.open(SolicitudCrearProyectoModalComponent, config);
        dialogRef.afterClosed().subscribe(
          (result: IProyecto) => {
            if (result) {
              const subscription = this.proyectoService.crearProyectoBySolicitud(solicitud.id, result);

              subscription.subscribe(
                () => {
                  this.snackBarService.showSuccess(MSG_SUCCESS_CREAR_PROYECTO);
                  this.loadTable();
                },
                (error) => {
                  this.logger.error(error);
                  this.snackBarService.showError(MSG_ERROR_CREAR_PROYECTO);
                }
              );

            }
          }
        );
      })
    ).subscribe());
  }
}
