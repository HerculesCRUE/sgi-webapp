import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { ISolicitudProyecto } from '@core/models/csp/solicitud-proyecto';
import { FormFragment } from '@core/services/action-service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SolicitudProyectoService } from '@core/services/csp/solicitud-proyecto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

export interface AreaTematicaSolicitudData {
  rootTree: IAreaTematica;
  areaTematicaConvocatoria: IAreaTematica;
  areaTematicaSolicitud: IAreaTematica;
  readonly: boolean;
}

export class SolicitudProyectoFichaGeneralFragment extends FormFragment<ISolicitudProyecto>{
  solicitudProyecto: ISolicitudProyecto;
  areasTematicas$ = new BehaviorSubject<AreaTematicaSolicitudData[]>([]);
  hasConvocatoria = false;
  readonly colaborativo$: Subject<boolean> = new BehaviorSubject<boolean>(false);
  readonly presupuestoPorEntidades$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private solicitudService: SolicitudService,
    private solicitudProyectoService: SolicitudProyectoService,
    private convocatoriaService: ConvocatoriaService,
    public readonly: boolean,
    private convocatoriaId: number
  ) {
    super(key, true);
    this.setComplete(true);
    this.solicitudProyecto = {} as ISolicitudProyecto;

    // Hack edit mode
    this.initialized$.pipe(
      take(2)
    ).subscribe(value => {
      if (value) {
        this.performChecks(true);
      }
    });
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup({
      titulo: new FormControl(undefined, [Validators.required, Validators.maxLength(250)]),
      acronimo: new FormControl(null, [Validators.maxLength(50)]),
      codExterno: new FormControl(undefined, [Validators.maxLength(250)]),
      duracion: new FormControl(null, [Validators.min(1), Validators.max(9999)]),
      colaborativo: new FormControl(undefined, [Validators.required]),
      coordinadorExterno: new FormControl(undefined, [Validators.required]),
      presupuestoPorEntidades: new FormControl(undefined, [Validators.required]),
      objetivos: new FormControl(null, [Validators.maxLength(2000)]),
      intereses: new FormControl(null, [Validators.maxLength(2000)]),
      resultadosPrevistos: new FormControl(null, [Validators.maxLength(2000)]),
      envioEtica: new FormControl(null, [])
    });

    if (this.readonly) {
      form.disable();
    }

    const colaborativo = form.controls.colaborativo;
    const coordinadorExterno = form.controls.coordinadorExterno;
    this.subscriptions.push(
      colaborativo.valueChanges.subscribe(
        (value) => {
          if (value && !this.readonly) {
            coordinadorExterno.enable();
          } else {
            coordinadorExterno.disable();
          }
          this.colaborativo$.next(value);
        }
      )
    );

    this.subscriptions.push(
      form.controls.presupuestoPorEntidades.valueChanges.subscribe((value) => {
        this.presupuestoPorEntidades$.next(value);
      })
    );
    return form;
  }

  /**
   * Deshabilitar presupuesto por entidades
   */
  disablePresupuestoPorEntidades(value: boolean): void {
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

  protected buildPatch(solicitudProyecto: ISolicitudProyecto): { [key: string]: any; } {
    if (solicitudProyecto) {
      this.solicitudProyecto = solicitudProyecto;
    }
    return {
      titulo: solicitudProyecto?.titulo,
      acronimo: solicitudProyecto?.acronimo,
      codExterno: solicitudProyecto?.codExterno,
      duracion: solicitudProyecto?.duracion,
      colaborativo: solicitudProyecto?.colaborativo,
      coordinadorExterno: solicitudProyecto?.coordinadorExterno,
      presupuestoPorEntidades: solicitudProyecto?.presupuestoPorEntidades,
      objetivos: solicitudProyecto?.objetivos,
      intereses: solicitudProyecto?.intereses,
      resultadosPrevistos: solicitudProyecto?.resultadosPrevistos,
      envioEtica: solicitudProyecto?.envioEtica
    };
  }

  protected initializer(key: number): Observable<ISolicitudProyecto> {

    return this.solicitudService.findSolicitudProyecto(key).pipe(
      switchMap((solicitudProyectoDatos) => {
        return this.loadSolicitudProyecto(solicitudProyectoDatos);
      }),
      switchMap(solicitudProyecto => {
        if (solicitudProyecto?.id) {
          return this.solicitudProyectoService.hasSolicitudSocio(solicitudProyecto?.id).pipe(
            map(hasSolicitudSocio => {
              this.disableSocioColaborador(hasSolicitudSocio);
              return solicitudProyecto;
            })
          );
        }
        return of(solicitudProyecto);
      }),
      switchMap(solicitudProyecto => {
        if (solicitudProyecto?.id) {
          return this.solicitudProyectoService.hasSolicitudPresupuesto(solicitudProyecto.id).pipe(
            map(hasSolicitudPresupuesto => {
              this.disablePresupuestoPorEntidades(hasSolicitudPresupuesto);
              return solicitudProyecto;
            })
          );
        }
        return of(solicitudProyecto);
      }),
      switchMap(solicitudProyecto => {
        if (this.convocatoriaId && !solicitudProyecto?.id) {
          return this.convocatoriaService.findById(this.convocatoriaId).pipe(
            map(convocatoria => {
              solicitudProyecto = {} as ISolicitudProyecto;
              solicitudProyecto.colaborativo = convocatoria.colaborativos;
              solicitudProyecto.duracion = convocatoria.duracion;
              return solicitudProyecto;
            })
          );
        }
        return of(solicitudProyecto);
      }),
      catchError(error => {
        this.logger.error(error);
        return EMPTY;
      })
    );
  }

  private loadSolicitudProyecto(solicitudProyecto: ISolicitudProyecto): Observable<ISolicitudProyecto> {
    if (solicitudProyecto?.id) {
      return this.solicitudService.findById(solicitudProyecto.id).pipe(
        switchMap(solicitud => {
          if (solicitud?.convocatoriaId) {
            this.hasConvocatoria = true;
            return this.convocatoriaService.findAreaTematicas(solicitud.id).pipe(
              map((results) => {
                const nodes = results.items.map(convocatoriaAreaTematica => {
                  const area: AreaTematicaSolicitudData = {
                    rootTree: this.getFirstLevelAreaTematica(convocatoriaAreaTematica.areaTematica),
                    areaTematicaConvocatoria: convocatoriaAreaTematica.areaTematica,
                    areaTematicaSolicitud: solicitudProyecto.areaTematica,
                    readonly: this.readonly
                  };
                  return area;
                });
                this.areasTematicas$.next(nodes);
                return results;
              }),
              switchMap(() => of(solicitudProyecto))
            );
          }
          return of(solicitudProyecto);
        })
      );
    }
    return of(solicitudProyecto);
  }

  getFirstLevelAreaTematica(areaTematica: IAreaTematica): IAreaTematica {
    if (areaTematica.padre) {
      return this.getFirstLevelAreaTematica(areaTematica.padre);
    }
    return areaTematica;
  }

  getValue(): ISolicitudProyecto {
    const form = this.getFormGroup().controls;
    this.solicitudProyecto.titulo = form.titulo.value;
    this.solicitudProyecto.acronimo = form.acronimo.value;
    this.solicitudProyecto.codExterno = form.codExterno.value;
    this.solicitudProyecto.duracion = form.duracion.value;
    this.solicitudProyecto.colaborativo = Boolean(form.colaborativo.value);
    this.solicitudProyecto.coordinadorExterno = Boolean(form.coordinadorExterno.value);
    this.solicitudProyecto.objetivos = form.objetivos.value;
    this.solicitudProyecto.intereses = form.intereses.value;
    this.solicitudProyecto.resultadosPrevistos = form.resultadosPrevistos.value;
    this.solicitudProyecto.envioEtica = form.envioEtica.value;
    this.solicitudProyecto.presupuestoPorEntidades = Boolean(form.presupuestoPorEntidades.value);
    return this.solicitudProyecto;
  }

  saveOrUpdate(): Observable<void> {
    const solicitudProyecto = this.getValue();
    const observable$ = this.solicitudProyecto.id ? this.update(solicitudProyecto) : this.create(solicitudProyecto);
    return observable$.pipe(
      map(value => {
        this.setChanges(false);
        this.solicitudProyecto = value;
        return void 0;
      })
    );
  }

  private create(solicitudProyecto: ISolicitudProyecto): Observable<ISolicitudProyecto> {
    solicitudProyecto.id = this.getKey() as number;
    return this.solicitudProyectoService.create(solicitudProyecto);
  }

  private update(solicitudProyecto: ISolicitudProyecto): Observable<ISolicitudProyecto> {
    return this.solicitudProyectoService.update(solicitudProyecto.id, solicitudProyecto);
  }
}
