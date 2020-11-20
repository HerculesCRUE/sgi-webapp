import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { IPersona } from '@core/models/sgp/persona';
import { Fragment } from '@core/services/action-service';
import { EquipoTrabajoService } from '@core/services/eti/equipo-trabajo.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { Observable, of, BehaviorSubject, from, zip, merge } from 'rxjs';
import { map, mergeMap, endWith, switchMap, tap, takeLast } from 'rxjs/operators';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiAuthService } from '@sgi/framework/auth';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';

export class EquipoInvestigadorListadoFragment extends Fragment {

  equiposTrabajo$: BehaviorSubject<StatusWrapper<IEquipoTrabajo>[]> = new BehaviorSubject<StatusWrapper<IEquipoTrabajo>[]>([]);
  private deletedEquiposTrabajo: StatusWrapper<IEquipoTrabajo>[] = [];

  private selectedIdPeticionEvaluacion: number;

  constructor(
    key: number,
    private logger: NGXLogger,
    private personaFisicaService: PersonaFisicaService,
    private equipoTrabajoService: EquipoTrabajoService,
    private peticionEvaluacionService: PeticionEvaluacionService,
    private sgiAuthService: SgiAuthService
  ) {
    super(key);
    this.selectedIdPeticionEvaluacion = key;
    this.setComplete(true);
  }

  onInitialize(): void {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'onInitialize()', 'start');
    this.loadEquiposTrabajo(this.getKey() as number);
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'onInitialize()', 'end');
  }

  loadEquiposTrabajo(idPeticionEvaluacion: number): void {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'loadEquiposTrabajo(idPeticionEvaluacion: number)', 'start');
    if (!this.isInitialized() || this.selectedIdPeticionEvaluacion !== idPeticionEvaluacion) {
      this.selectedIdPeticionEvaluacion = idPeticionEvaluacion;

      let equiposTrabajoRecuperados$: Observable<StatusWrapper<IEquipoTrabajo>[]>;

      // Si es una petición de evaluación nueva se añade el usuario actual a la lista
      if (!this.selectedIdPeticionEvaluacion) {
        equiposTrabajoRecuperados$ = this.getInvestigadorActual()
          .pipe(
            map((equipoTrabajo: IEquipoTrabajo) => {
              const wrapper = new StatusWrapper<IEquipoTrabajo>(equipoTrabajo);
              wrapper.setCreated();
              return [wrapper];
            }),
            tap(_ => this.setChanges(true))
          );
      } else {
        equiposTrabajoRecuperados$ = this.peticionEvaluacionService.findEquipoInvestigador(idPeticionEvaluacion).pipe(
          switchMap((response) => {
            const equiposTrabajo = response.items;

            if (response.items) {
              const personaRefsEquiposTrabajo = equiposTrabajo.map((equipoTrabajo: IEquipoTrabajo) => equipoTrabajo.personaRef);
              const equiposTrabajoWithDatosPersona$ = this.personaFisicaService.findByPersonasRefs([...personaRefsEquiposTrabajo]).pipe(
                map((result: SgiRestListResult<IPersona>) => {
                  const personas = result.items;

                  equiposTrabajo.forEach((equipoTrabajo: IEquipoTrabajo) => {
                    const datosPersona = personas.find((persona: IPersona) =>
                      equipoTrabajo.personaRef === persona.personaRef);

                    equipoTrabajo.nombre = datosPersona?.nombre;
                    equipoTrabajo.primerApellido = datosPersona?.primerApellido;
                    equipoTrabajo.segundoApellido = datosPersona?.segundoApellido;
                    equipoTrabajo.identificadorNumero = datosPersona?.identificadorNumero;
                    equipoTrabajo.identificadorLetra = datosPersona?.identificadorLetra;
                    equipoTrabajo.vinculacion = 'PDI';
                    equipoTrabajo.nivelAcademico = 'Licenciado';
                    equipoTrabajo.eliminable = equipoTrabajo.personaRef !==
                      this.sgiAuthService.authStatus$.getValue().userRefId && equipoTrabajo.eliminable;
                  });

                  return equiposTrabajo.map((equipoTrabajo) => new StatusWrapper<IEquipoTrabajo>(equipoTrabajo));
                })
              );

              return equiposTrabajoWithDatosPersona$;
            }
            else {
              return of([]);
            }
          })
        );
      }

      equiposTrabajoRecuperados$.subscribe((equiposTrabajo) => {
        this.setComplete(true);
        this.equiposTrabajo$.next(equiposTrabajo);
        this.logger.debug(EquipoInvestigadorListadoFragment.name, 'loadEquiposTrabajo(idPeticionEvaluacion: number)', 'end');
      });
    }
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'saveOrUpdate()', 'start');
    return merge(
      this.deleteEquipos(),
      this.createEquipos()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(EquipoInvestigadorListadoFragment.name, 'saveOrUpdate()', 'end'))
    );
  }

  /**
   * Añade un nuevo miembro al equipo investigador
   *
   * @param equipoTrabajo un equipoTrabajo
   */
  addEquipoTrabajo(equipoTrabajo: IEquipoTrabajo): void {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'addEquipoTrabajo(equipoTrabajo: IEquipoTrabajo)', 'start');
    const wrapped = new StatusWrapper<IEquipoTrabajo>(equipoTrabajo);
    wrapped.setCreated();
    const current = this.equiposTrabajo$.value;
    current.push(wrapped);
    this.equiposTrabajo$.next(current);
    this.setChanges(true);
    this.setComplete(true);
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'addEquipoTrabajo(equipoTrabajo: IEquipoTrabajo)', 'end');
  }

  /**
   * Elimina un miembro del equipo investigador de la lista de equipos de trabajo y le añade a la de equipos de trabajo a eliminar.
   *
   * @param equipoTrabajo un equipoTrabajo
   */
  deleteEquipoTrabajo(equipoTrabajo: StatusWrapper<IEquipoTrabajo>): void {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'deleteEquipoTrabajo(equipoTrabajo: StatusWrapper<IEquipoTrabajo>)', 'start');
    const current = this.equiposTrabajo$.value;
    const index = current.findIndex((value) => value === equipoTrabajo);
    if (index >= 0) {
      if (!equipoTrabajo.created) {
        current[index].setDeleted();
        this.deletedEquiposTrabajo.push(current[index]);
      }

      current.splice(index, 1);
      this.equiposTrabajo$.next(current);
      this.setChanges(true);
    }

    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'deleteEquipoTrabajo(equipoTrabajo: StatusWrapper<IEquipoTrabajo>)', 'end');
  }

  /**
   * Devuelve un observable con el investigador actual como miembro del equipo de trabajo.
   *
   * @return observable con el investigador actual.
   */
  private getInvestigadorActual(): Observable<IEquipoTrabajo> {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'getInvestigadorActual()', 'start');

    return this.personaFisicaService.getInformacionBasica(this.sgiAuthService.authStatus$?.getValue()?.userRefId)
      .pipe(
        map((persona: IPersona) => {
          this.logger.debug(EquipoInvestigadorListadoFragment.name, 'getInvestigadorActual()', 'end');
          return {
            id: null,
            peticionEvaluacion: null,
            personaRef: persona.personaRef,
            nombre: persona.nombre,
            primerApellido: persona.primerApellido,
            segundoApellido: persona.segundoApellido,
            identificadorNumero: persona.identificadorNumero,
            identificadorLetra: persona.identificadorLetra,
            nivelAcademico: 'Licenciado',
            vinculacion: 'PDI',
            eliminable: false
          };
        })
      );
  }

  private deleteEquipos(): Observable<void> {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'deleteEquipos()', 'start');
    if (this.deletedEquiposTrabajo.length === 0) {
      this.logger.debug(EquipoInvestigadorListadoFragment.name, 'deleteEquipos()', 'end');
      return of(void 0);
    }
    return from(this.deletedEquiposTrabajo).pipe(
      mergeMap((wrappedEquipoTrabajo) => {
        return this.peticionEvaluacionService
          .deleteEquipoTrabajoPeticionEvaluacion(wrappedEquipoTrabajo.value.peticionEvaluacion.id, wrappedEquipoTrabajo.value.id)
          .pipe(
            tap(_ => {
              this.deletedEquiposTrabajo = this.deletedEquiposTrabajo.filter(deletedEquipoTrabajo =>
                deletedEquipoTrabajo.value.id !== wrappedEquipoTrabajo.value.id);
            })
          );
      }));
  }

  private createEquipos(): Observable<void> {
    this.logger.debug(EquipoInvestigadorListadoFragment.name, 'createEquipos()', 'start');
    const createdEquipos = this.equiposTrabajo$.value.filter((equipo) => equipo.created);
    if (createdEquipos.length === 0) {
      this.logger.debug(EquipoInvestigadorListadoFragment.name, 'createEquipos()', 'end');
      return of(void 0);
    }

    return from(createdEquipos).pipe(
      mergeMap((wrappedEquipoTrabajo) => {
        return this.peticionEvaluacionService.createEquipoTrabajo(this.getKey() as number, wrappedEquipoTrabajo.value).pipe(
          map((savedEquipoTrabajo) => {
            const index = this.equiposTrabajo$.value.findIndex((currentEquipoTrabajo) => currentEquipoTrabajo === wrappedEquipoTrabajo);
            this.equiposTrabajo$.value[index] = new StatusWrapper<IEquipoTrabajo>(savedEquipoTrabajo);
            this.equiposTrabajo$.next(this.equiposTrabajo$.value);
          })
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.equiposTrabajo$.value.some((wrapper) => wrapper.touched);
    if (this.deletedEquiposTrabajo.length > 0 || touched) {
      return false;
    }
    return true;
  }
}
