import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTablePaginationComponent } from '@core/component/abstract-table-pagination.component';
import { MSG_PARAMS } from '@core/i18n';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { ESTADO_MAP } from '@core/models/csp/estado-solicitud';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { IPrograma } from '@core/models/csp/programa';
import { IProyecto } from '@core/models/csp/proyecto';
import { ISolicitud } from '@core/models/csp/solicitud';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ROUTE_NAMES } from '@core/route.names';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { FuenteFinanciacionService } from '@core/services/csp/fuente-financiacion.service';
import { ProgramaService } from '@core/services/csp/programa.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { DialogService } from '@core/services/dialog.service';
import { PersonaService } from '@core/services/sgp/persona.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { LuxonUtils } from '@core/utils/luxon-utils';
import { TranslateService } from '@ngx-translate/core';
import { RSQLSgiRestFilter, SgiRestFilter, SgiRestFilterOperator, SgiRestListResult } from '@sgi/framework/http';
import { TipoColectivo } from '@shared/select-persona/select-persona.component';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ISolicitudCrearProyectoModalData, SolicitudCrearProyectoModalComponent } from '../modals/solicitud-crear-proyecto-modal/solicitud-crear-proyecto-modal.component';

const MSG_BUTTON_NEW = marker('btn.add.entity');
const MSG_ERROR = marker('error.load');
const MSG_DEACTIVATE = marker('msg.deactivate.entity');
const MSG_SUCCESS_DEACTIVATE = marker('msg.csp.deactivate.success');
const MSG_ERROR_DEACTIVATE = marker('error.csp.deactivate.entity');
const MSG_REACTIVE = marker('msg.csp.reactivate');
const MSG_SUCCESS_REACTIVE = marker('msg.reactivate.entity.success');
const MSG_ERROR_REACTIVE = marker('error.reactivate.entity');
const MSG_SUCCESS_CREAR_PROYECTO = marker('msg.csp.solicitud.crear.proyecto');
const MSG_ERROR_CREAR_PROYECTO = marker('error.csp.solicitud.crear.proyecto');
const SOLICITUD_KEY = marker('csp.solicitud');

interface SolicitudListado extends ISolicitud {
  convocatoria: IConvocatoria;
}

@Component({
  selector: 'sgi-solicitud-listado',
  templateUrl: './solicitud-listado.component.html',
  styleUrls: ['./solicitud-listado.component.scss']
})
export class SolicitudListadoComponent extends AbstractTablePaginationComponent<SolicitudListado> implements OnInit {
  ROUTE_NAMES = ROUTE_NAMES;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  solicitudes$: Observable<SolicitudListado[]>;
  textoCrear: string;
  textoDesactivar: string;
  textoReactivar: string;
  textoErrorDesactivar: string;
  textoSuccessDesactivar: string;
  textoSuccessReactivar: string;
  textoErrorReactivar: string;

  busquedaAvanzada = false;
  private fuenteFinanciacionFiltered: IFuenteFinanciacion[] = [];
  fuenteFinanciacion$: Observable<IFuenteFinanciacion[]>;
  private planInvestigacionFiltered: IPrograma[] = [];
  planInvestigaciones$: Observable<IPrograma[]>;

  mapCrearProyecto: Map<number, boolean> = new Map();
  mapModificable: Map<number, boolean> = new Map();

  msgParamConvocatoriaExternaEntity = {};
  msgParamCodigoExternoEntity = {};
  msgParamObservacionesEntity = {};
  msgParamUnidadGestionEntity = {};

  get tipoColectivoSolicitante() {
    return TipoColectivo.SOLICITANTE_CSP;
  }

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  get MSG_PARAMS() {
    return MSG_PARAMS;
  }

  constructor(
    private readonly logger: NGXLogger,
    private dialogService: DialogService,
    protected snackBarService: SnackBarService,
    private solicitudService: SolicitudService,
    private personaService: PersonaService,
    private fuenteFinanciacionService: FuenteFinanciacionService,
    private programaService: ProgramaService,
    private proyectoService: ProyectoService,
    private matDialog: MatDialog,
    private readonly translate: TranslateService,
    private convocatoriaService: ConvocatoriaService
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
    this.setupI18N();

    this.formGroup = new FormGroup({
      convocatoria: new FormControl(undefined),
      estadoSolicitud: new FormControl(''),
      plazoAbierto: new FormControl(false),
      fechaInicioDesde: new FormControl(null),
      fechaInicioHasta: new FormControl(null),
      fechaFinDesde: new FormControl(null),
      fechaFinHasta: new FormControl(null),
      solicitante: new FormControl(undefined),
      activo: new FormControl('true'),
      fechaPublicacionConvocatoriaDesde: new FormControl(null),
      fechaPublicacionConvocatoriaHasta: new FormControl(null),
      tituloConvocatoria: new FormControl(undefined),
      entidadConvocante: new FormControl(undefined),
      planInvestigacion: new FormControl(undefined),
      entidadFinanciadora: new FormControl(undefined),
      fuenteFinanciacion: new FormControl(undefined)
    });

    this.getFuentesFinanciacion();
    this.getPlanesInvestigacion();
  }

  private setupI18N(): void {
    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_BUTTON_NEW,
          { entity: value }
        );
      })
    ).subscribe((value) => this.textoCrear = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_DEACTIVATE,
          { entity: value }
        );
      })
    ).subscribe((value) => this.textoDesactivar = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_ERROR_DEACTIVATE,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoErrorDesactivar = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_SUCCESS_DEACTIVATE,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoSuccessDesactivar = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_REACTIVE,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoReactivar = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_SUCCESS_REACTIVE,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoSuccessReactivar = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_ERROR_REACTIVE,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoErrorReactivar = value);
  }

  protected createObservable(): Observable<SgiRestListResult<SolicitudListado>> {
    const observable$ = this.solicitudService.findAllTodos(this.getFindOptions()).pipe(
      map(response => {
        return response as SgiRestListResult<SolicitudListado>;
      }),
      switchMap(response => {
        const requestsConvocatoria: Observable<SolicitudListado>[] = [];
        response.items.forEach(solicitud => {
          if (solicitud.convocatoriaId) {
            requestsConvocatoria.push(this.convocatoriaService.findById(solicitud.convocatoriaId).pipe(
              map(convocatoria => {
                solicitud.convocatoria = convocatoria;
                return solicitud;
              })
            ));
          }
          else {
            requestsConvocatoria.push(of(solicitud));
          }
        });
        return of(response).pipe(
          tap(() => merge(...requestsConvocatoria).subscribe())
        );
      }),
      switchMap((response) => {
        if (response.total === 0) {
          return of(response);
        }

        const solicitudes = response.items;
        const personaIdsSolicitantes = new Set<string>(solicitudes.map((solicitud) => solicitud.solicitante.id));
        const solicitudesWithDatosSolicitante$ = this.personaService.findAllByIdIn([...personaIdsSolicitantes]).pipe(
          map((result) => {
            const personas = result.items;

            solicitudes.forEach((solicitud) => {
              this.suscripciones.push(this.solicitudService.isPosibleCrearProyecto(solicitud.id).subscribe((value) => {
                this.mapCrearProyecto.set(solicitud.id, value);
              }));
              solicitud.solicitante = personas.find((persona) =>
                solicitud.solicitante.id === persona.id);

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
      'codigoRegistroInterno',
      'codigoExterno',
      'convocatoria.titulo',
      'referencia',
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
    const filter = new RSQLSgiRestFilter('convocatoria.id', SgiRestFilterOperator.EQUALS, controls.convocatoria.value?.id?.toString())
      .and('estado.estado', SgiRestFilterOperator.EQUALS, controls.estadoSolicitud.value);
    if (this.busquedaAvanzada) {
      if (controls.plazoAbierto.value) {
        filter.and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaInicio',
          SgiRestFilterOperator.GREATHER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaInicioDesde.value))
          .and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaInicio',
            SgiRestFilterOperator.LOWER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaInicioHasta.value))
          .and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaFin',
            SgiRestFilterOperator.GREATHER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaFinDesde.value))
          .and('convocatoria.configuracionSolicitud.fasePresentacionSolicitudes.fechaFin',
            SgiRestFilterOperator.LOWER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaFinHasta.value));
      }
      filter
        .and('solicitanteRef', SgiRestFilterOperator.EQUALS, controls.solicitante.value?.id)
        .and('activo', SgiRestFilterOperator.EQUALS, controls.activo.value)
        .and('convocatoria.fechaPublicacion', SgiRestFilterOperator.GREATHER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaPublicacionConvocatoriaDesde.value))
        .and('convocatoria.fechaPublicacion', SgiRestFilterOperator.LOWER_OR_EQUAL, LuxonUtils.toBackend(controls.fechaPublicacionConvocatoriaHasta.value))
        .and('convocatoria.titulo', SgiRestFilterOperator.LIKE_ICASE, controls.tituloConvocatoria.value)
        .and('convocatoria.entidadesConvocantes.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadConvocante.value?.id)
        .and('convocatoria.entidadesConvocantes.programa.id',
          SgiRestFilterOperator.EQUALS, controls.planInvestigacion.value?.id?.toString())
        .and('convocatoria.entidadesFinanciadoras.entidadRef', SgiRestFilterOperator.EQUALS, controls.entidadFinanciadora.value?.id)
        .and('convocatoria.entidadesFinanciadoras.fuenteFinanciacion.id',
          SgiRestFilterOperator.EQUALS, controls.fuenteFinanciacion.value?.id?.toString());
    }

    return filter;
  }

  /**
   * Activar solicitud
   * @param solicitud una solicitud
   */
  activateSolicitud(solicitud: ISolicitud): void {
    const subcription = this.dialogService.showConfirmation(this.textoReactivar).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.solicitudService.reactivar(solicitud.id);
        } else {
          return of();
        }
      })
    ).subscribe(
      () => {
        this.snackBarService.showSuccess(this.textoSuccessReactivar);
        this.loadTable();
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(this.textoErrorReactivar);
      }
    );
    this.suscripciones.push(subcription);
  }

  /**
   * Desactivar solicitud
   * @param solicitud una solicitud
   */
  deactivateSolicitud(solicitud: ISolicitud): void {
    const subcription = this.dialogService.showConfirmation(this.textoDesactivar).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.solicitudService.desactivar(solicitud.id);
        } else {
          return of();
        }
      })
    ).subscribe(
      () => {
        this.snackBarService.showSuccess(this.textoSuccessDesactivar);
        this.loadTable();
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(this.textoErrorDesactivar);
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
    this.formGroup.controls.fechaInicioDesde.setValue(null);
    this.formGroup.controls.fechaInicioHasta.setValue(null);
    this.formGroup.controls.fechaFinDesde.setValue(null);
    this.formGroup.controls.fechaFinHasta.setValue(null);
    this.formGroup.controls.solicitante.setValue(undefined);
    this.formGroup.controls.activo.setValue('true');
    this.formGroup.controls.fechaPublicacionConvocatoriaDesde.setValue(null);
    this.formGroup.controls.fechaPublicacionConvocatoriaHasta.setValue(null);
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
          this.snackBarService.showError(MSG_ERROR);
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
          this.snackBarService.showError(MSG_ERROR);
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
    this.suscripciones.push(this.solicitudService.findSolicitudProyecto(solicitud.id).pipe(
      map(solicitudProyectoDatos => {
        const config = {
          panelClass: 'sgi-dialog-container',
          data: { solicitud, solicitudProyecto: solicitudProyectoDatos } as ISolicitudCrearProyectoModalData
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
