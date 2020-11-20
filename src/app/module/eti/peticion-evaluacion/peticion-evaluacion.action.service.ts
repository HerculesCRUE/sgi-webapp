import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { ActionService, IFragment } from '@core/services/action-service';
import { EquipoTrabajoService } from '@core/services/eti/equipo-trabajo.service';
import { SgiAuthService } from '@sgi/framework/auth/';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { TareaService } from '@core/services/eti/tarea.service';
import { PeticionEvaluacionDatosGeneralesFragment } from './peticion-evaluacion-formulario/peticion-evaluacion-datos-generales/peticion-evaluacion-datos-generales.fragment';
import { EquipoInvestigadorListadoFragment } from './peticion-evaluacion-formulario/equipo-investigador/equipo-investigador-listado/equipo-investigador-listado.fragment';
import { MemoriasListadoFragment } from './peticion-evaluacion-formulario/memorias-listado/memorias-listado.fragment';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { PeticionEvaluacionTareasFragment } from './peticion-evaluacion-formulario/peticion-evaluacion-tareas/peticion-evaluacion-tareas-listado/peticion-evaluacion-tareas-listado.fragment';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { Observable, throwError, from, of } from 'rxjs';
import { filter, concatMap, switchMap, tap, takeLast } from 'rxjs/operators';


@Injectable()
export class PeticionEvaluacionActionService extends ActionService {
  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    EQUIPO_INVESTIGADOR: 'equipoInvestigador',
    TAREAS: 'tareas',
    MEMORIAS: 'memorias'
  };

  public readonly: boolean;

  private peticionEvaluacion: IPeticionEvaluacion;
  private datosGenerales: PeticionEvaluacionDatosGeneralesFragment;
  private equipoInvestigadorListado: EquipoInvestigadorListadoFragment;
  private tareas: PeticionEvaluacionTareasFragment;
  private memoriasListado: MemoriasListadoFragment;
  private fragmentos: IFragment[] = [];


  constructor(
    fb: FormBuilder,
    protected readonly peticionEvaluacionService: PeticionEvaluacionService,
    private readonly route: ActivatedRoute,
    private readonly sgiAuthService: SgiAuthService,
    protected readonly logger: NGXLogger,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected readonly equipoTrabajoService: EquipoTrabajoService,
    protected readonly tareaService: TareaService
  ) {
    super();

    this.peticionEvaluacion = {} as IPeticionEvaluacion;

    if (route.snapshot.data.peticionEvaluacion) {
      this.peticionEvaluacion = route.snapshot.data.peticionEvaluacion;
      this.enableEdit();
      this.readonly = route.snapshot.data.readonly;
    }

    this.datosGenerales =
      new PeticionEvaluacionDatosGeneralesFragment(
        fb, this.peticionEvaluacion?.id, peticionEvaluacionService, sgiAuthService, this.readonly);
    this.equipoInvestigadorListado = new EquipoInvestigadorListadoFragment(
      this.peticionEvaluacion?.id, logger, personaFisicaService, equipoTrabajoService, peticionEvaluacionService, sgiAuthService);
    this.memoriasListado = new MemoriasListadoFragment(this.peticionEvaluacion?.id, peticionEvaluacionService);
    this.tareas = new PeticionEvaluacionTareasFragment(this.peticionEvaluacion?.id, logger, personaFisicaService, tareaService,
      peticionEvaluacionService, this.equipoInvestigadorListado, this.memoriasListado);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.EQUIPO_INVESTIGADOR, this.equipoInvestigadorListado);
    this.tareas.setEquiposTrabajo(this.equipoInvestigadorListado.equiposTrabajo$.value.map((equipoTrabajo) => equipoTrabajo.value));
    this.tareas.setMemorias(this.memoriasListado.memorias$.value.map((memoria) => memoria.value));
    this.addFragment(this.FRAGMENT.TAREAS, this.tareas);
    this.addFragment(this.FRAGMENT.MEMORIAS, this.memoriasListado);

    this.fragmentos.push(this.datosGenerales);
    this.fragmentos.push(this.equipoInvestigadorListado);
    this.fragmentos.push(this.tareas);
    this.fragmentos.push(this.memoriasListado);

    this.equipoInvestigadorListado.equiposTrabajo$.subscribe(list => {
      this.tareas.setEquiposTrabajo(list.map((equipoTrabajo) => equipoTrabajo.value));
    });

    this.memoriasListado.memorias$.subscribe(list => {
      this.tareas.setMemorias(list.map((memoria) => memoria.value));
    });
  }

  /**
   * Elimina las tareas asociadas al equipo de trabajo.
   *
   * @param equipoTrabajo el equipo de trabajo.
   */
  public eliminarTareasEquipoTrabajo(equipoTrabajo: StatusWrapper<IEquipoTrabajo>): void {
    this.logger.debug(PeticionEvaluacionActionService.name, 'eliminarTareasNoPersistidasEquipoTrabajo(idEquipoTrabajo: number)', 'start');
    this.tareas.deleteTareasEquipoTrabajo(equipoTrabajo);
    this.logger.debug(PeticionEvaluacionActionService.name, 'eliminarTareasNoPersistidasEquipoTrabajo(idEquipoTrabajo: number)', 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.performChecks(true);
    if (this.hasErrors()) {
      return throwError('Errores');
    }
    if (this.isEdit()) {
      return from(this.fragmentos.values()).pipe(
        filter((part) => part.hasChanges()),
        concatMap((part) => part.saveOrUpdate().pipe(
          switchMap(() => {
            return of(void 0);
          }),
          tap(() => part.refreshInitialState(true)))
        ),
        takeLast(1)
      );
    }
    else {
      const part = this.datosGenerales;
      return part.saveOrUpdate().pipe(
        tap(() => part.refreshInitialState(true)),
        switchMap((k) => {
          if (typeof k === 'string' || typeof k === 'number') {
            this.onKeyChange(k);
          }
          return this.saveOrUpdate();
        }),
        takeLast(1)
      );
    }
  }

}

