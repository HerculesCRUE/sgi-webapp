import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { ISolicitud } from '@core/models/csp/solicitud';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { FormFragment } from '@core/services/action-service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SolicitudProyectoDatosService } from '@core/services/csp/solicitud-proyecto-datos.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SolicitudActionService } from '../../solicitud.action.service';

export interface AreaTematicaSolicitudData {
  rootTree: IAreaTematica;
  areaTematicaConvocatoria: IAreaTematica;
  areaTematicaSolicitud: IAreaTematica;
  readonly: boolean;
}
export class SolicitudProyectoFichaGeneralFragment extends FormFragment<ISolicitudProyectoDatos>{
  solicitudProyectoDatos: ISolicitudProyectoDatos;
  areasTematicas$ = new BehaviorSubject<AreaTematicaSolicitudData[]>([]);
  coordinadorExterno$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly logger: NGXLogger,
    private solicitud: ISolicitud,
    private solicitudService: SolicitudService,
    private solicitudProyectoDatosService: SolicitudProyectoDatosService,
    private convocatoriaService: ConvocatoriaService,
    private actionService: SolicitudActionService,
    public readonly: boolean
  ) {
    super(solicitud?.id, true);
    this.setComplete(true);
    this.solicitudProyectoDatos = {} as ISolicitudProyectoDatos;
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup({
      titulo: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      acronimo: new FormControl('', [Validators.maxLength(50)]),
      duracion: new FormControl('', [Validators.min(1), Validators.max(9999)]),
      colaborativo: new FormControl('', [Validators.required]),
      coordinadorExterno: new FormControl('', [Validators.required]),
      universidadSubcontratada: new FormControl('', []),
      presupuestoPorEntidades: new FormControl('', [Validators.required]),
      objetivos: new FormControl('', [Validators.maxLength(2000)]),
      intereses: new FormControl('', [Validators.maxLength(2000)]),
      resultadosPrevistos: new FormControl('', [Validators.maxLength(2000)]),
      envioEtica: new FormControl('', [])
    });

    if (this.readonly) {
      form.disable();
    }

    return form;
  }

  /**
   * Deshabilitar presupuesto global en caso
   * de tener datos la pestaña
   * Desglose presupuesto entidad
   */
  disablePresupuestoGlobalEntidad(value: boolean): void {
    if (value) {
      this.getFormGroup()?.controls.presupuestoPorEntidades.disable();
    } else {
      this.getFormGroup()?.controls.presupuestoPorEntidades.enable();
    }
  }

  /**
   * Deshabilitar presupuesto global en caso
   * de tener datos la pestaña
   * Desglose presupuesto
   */
  disablePresupuestoGlobal(value: boolean): void {
    if (value) {
      this.getFormGroup()?.controls.presupuestoPorEntidades.disable();
    } else {
      this.getFormGroup()?.controls.presupuestoPorEntidades.enable();
    }
  }

  /**
   * Deshabilitar proyecto colaborativo en caso
   * de tener datos la pestaña
   * Socio colaboradores
   */
  disableSocioColaborador(value: boolean): void {
    if (value) {
      this.getFormGroup()?.controls.colaborativo.disable();
    } else {
      this.getFormGroup()?.controls.colaborativo.enable();
    }
  }

  protected buildPatch(proyectoDatos: ISolicitudProyectoDatos): { [key: string]: any; } {
    const result = {
      titulo: proyectoDatos.titulo,
      acronimo: proyectoDatos.acronimo,
      duracion: proyectoDatos.duracion,
      colaborativo: proyectoDatos.colaborativo,
      coordinadorExterno: proyectoDatos.coordinadorExterno,
      universidadSubcontratada: proyectoDatos.universidadSubcontratada,
      presupuestoPorEntidades: proyectoDatos.presupuestoPorEntidades,
      objetivos: proyectoDatos.objetivos,
      intereses: proyectoDatos.intereses,
      resultadosPrevistos: proyectoDatos.resultadosPrevistos,
      envioEtica: proyectoDatos.envioEtica
    };
    this.actionService.sociosColaboradores = proyectoDatos.colaborativo;
    this.actionService.enableAddSocioColaborador = proyectoDatos.colaborativo;

    const form = this.getFormGroup();
    const coordinadorExterno = form.get('coordinadorExterno');
    const colaborativo = form.get('colaborativo');
    this.subscriptions.push(
      colaborativo.valueChanges.subscribe(
        (value) => {
          if (value === false) {
            coordinadorExterno.disable();
          } else {
            if (!this.readonly) {
              coordinadorExterno.enable();
            }
            coordinadorExterno.setValue(proyectoDatos.coordinadorExterno);
          }
          this.actionService.sociosColaboradores = value;
        }
      )
    );
    this.subscriptions.push(
      colaborativo.valueChanges.subscribe(
        (value) => this.actionService.enableAddSocioColaborador = value)
    );

    this.subscriptions.push(
      coordinadorExterno.valueChanges.subscribe((value) => {
        this.coordinadorExterno$.next(value);
      })
    );

    return result;
  }

  protected initializer(key: number): Observable<ISolicitudProyectoDatos> {
    return this.solicitudService.findSolicitudProyectoDatos(key).pipe(
      map(solicitudProyectoDatos => {
        const newProyecto: ISolicitudProyectoDatos = {
          acronimo: undefined,
          areaTematica: undefined,
          checkListRef: undefined,
          colaborativo: undefined,
          coordinadorExterno: undefined,
          duracion: undefined,
          envioEtica: undefined,
          id: undefined,
          intereses: undefined,
          objetivos: undefined,
          presupuestoPorEntidades: undefined,
          resultadosPrevistos: undefined,
          solicitud: this.solicitud,
          titulo: undefined,
          universidadSubcontratada: undefined
        };
        this.solicitudProyectoDatos = solicitudProyectoDatos ? solicitudProyectoDatos : newProyecto;
        return this.solicitudProyectoDatos;
      }),
      switchMap((solicitudProyectoDatos) => {
        if (solicitudProyectoDatos?.solicitud?.convocatoria) {
          const id = solicitudProyectoDatos.solicitud.convocatoria.id;
          return this.convocatoriaService.findAreaTematicas(id).pipe(
            map((results) => {
              const nodes = results.items.map(convocatoriaAreaTematica => {
                const area: AreaTematicaSolicitudData = {
                  rootTree: this.getFirstLevelAreaTematica(convocatoriaAreaTematica.areaTematica),
                  areaTematicaConvocatoria: convocatoriaAreaTematica.areaTematica,
                  areaTematicaSolicitud: solicitudProyectoDatos.areaTematica,
                  readonly: this.readonly
                };
                return area;
              });
              this.areasTematicas$.next(nodes);
              return results;
            }),
            switchMap(() => of(solicitudProyectoDatos))
          );
        }
        return of(solicitudProyectoDatos);
      }),
      switchMap(solicitudProyectoDatos => {
        if (solicitudProyectoDatos?.id) {
          return this.solicitudProyectoDatosService.hasSolicitudSocio(solicitudProyectoDatos?.id).pipe(
            map(status => {
              this.disableSocioColaborador(status);
              return solicitudProyectoDatos;
            })
          );
        }
        return of(solicitudProyectoDatos);
      }),

      switchMap(solicitudProyectoDatos => {
        if (solicitudProyectoDatos?.id && !solicitudProyectoDatos?.presupuestoPorEntidades) {
          return this.solicitudProyectoDatosService.hasSolicitudPresupuesto(solicitudProyectoDatos?.id).pipe(
            map(status => {
              this.disablePresupuestoGlobal(status);
              return solicitudProyectoDatos;
            })
          );
        }
        return of(solicitudProyectoDatos);
      }),

      switchMap(solicitudProyectoDatos => {
        if (solicitudProyectoDatos?.id && solicitudProyectoDatos?.presupuestoPorEntidades
          && !solicitudProyectoDatos?.solicitud?.convocatoria?.id) {
          return this.solicitudProyectoDatosService.hasSolicitudEntidadFinanciadora(solicitudProyectoDatos?.id).pipe(
            map(status => {
              this.disablePresupuestoGlobalEntidad(status);
              return solicitudProyectoDatos;
            })
          );
        }
        return of(solicitudProyectoDatos);
      }),
      switchMap(solicitudProyectoDatos => {
        if (solicitudProyectoDatos?.solicitud?.convocatoria?.id && solicitudProyectoDatos?.presupuestoPorEntidades) {
          return this.convocatoriaService.hasConvocatoriaEntidad(solicitudProyectoDatos?.solicitud.id).pipe(
            map(status => {
              this.disablePresupuestoGlobalEntidad(!status);
              return solicitudProyectoDatos;
            })
          );
        }
        return of(solicitudProyectoDatos);
      }),
      catchError(error => {
        this.logger.error(error);
        return EMPTY;
      })
    );
  }


  getFirstLevelAreaTematica(areaTematica: IAreaTematica): IAreaTematica {
    if (areaTematica.padre) {
      return this.getFirstLevelAreaTematica(areaTematica.padre);
    }
    return areaTematica;
  }

  getValue(): ISolicitudProyectoDatos {
    const form = this.getFormGroup().value;
    this.solicitudProyectoDatos.titulo = form.titulo;
    this.solicitudProyectoDatos.acronimo = form.acronimo;
    this.solicitudProyectoDatos.duracion = form.duracion;
    this.solicitudProyectoDatos.colaborativo = Boolean(form.colaborativo);
    this.solicitudProyectoDatos.coordinadorExterno = Boolean(form.coordinadorExterno);
    this.solicitudProyectoDatos.universidadSubcontratada = form.universidadSubcontratada;
    this.solicitudProyectoDatos.objetivos = form.objetivos;
    this.solicitudProyectoDatos.intereses = form.intereses;
    this.solicitudProyectoDatos.resultadosPrevistos = form.resultadosPrevistos;
    this.solicitudProyectoDatos.envioEtica = form.envioEtica;
    this.solicitudProyectoDatos.presupuestoPorEntidades = Boolean(form.presupuestoPorEntidades);
    return this.solicitudProyectoDatos;
  }

  saveOrUpdate(): Observable<number> {
    const solicitudProyectoDatos = this.getValue();
    const observable$ = this.solicitudProyectoDatos.id ? this.update(solicitudProyectoDatos) :
      this.create(solicitudProyectoDatos);
    return observable$.pipe(
      map(value => {
        this.solicitudProyectoDatos = value;
        this.refreshInitialState(true);
        return this.solicitudProyectoDatos.id;
      })
    );
  }

  private create(solicitudProyectoDatos: ISolicitudProyectoDatos): Observable<ISolicitudProyectoDatos> {
    solicitudProyectoDatos.solicitud = {
      id: this.getKey()
    } as ISolicitud;
    return this.solicitudProyectoDatosService.create(solicitudProyectoDatos);
  }

  private update(solicitudProyectoDatos: ISolicitudProyectoDatos): Observable<ISolicitudProyectoDatos> {
    return this.solicitudProyectoDatosService.update(solicitudProyectoDatos.id, solicitudProyectoDatos);
  }
}
