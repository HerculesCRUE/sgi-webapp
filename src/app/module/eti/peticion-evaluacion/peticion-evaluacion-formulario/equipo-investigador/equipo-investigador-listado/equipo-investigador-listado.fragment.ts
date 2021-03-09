import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { IPersona } from '@core/models/sgp/persona';
import { Fragment } from '@core/services/action-service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiAuthService } from '@sgi/framework/auth';
import { SgiRestListResult } from '@sgi/framework/http';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export class EquipoInvestigadorListadoFragment extends Fragment {

  equiposTrabajo$: BehaviorSubject<StatusWrapper<IEquipoTrabajo>[]> = new BehaviorSubject<StatusWrapper<IEquipoTrabajo>[]>([]);
  private deletedEquiposTrabajo: StatusWrapper<IEquipoTrabajo>[] = [];

  private selectedIdPeticionEvaluacion: number;

  constructor(
    key: number,
    private personaFisicaService: PersonaFisicaService,
    private peticionEvaluacionService: PeticionEvaluacionService,
    private sgiAuthService: SgiAuthService
  ) {
    super(key);
    this.selectedIdPeticionEvaluacion = key;
    this.setComplete(true);
  }

  onInitialize(): void {
    this.loadEquiposTrabajo(this.getKey() as number);
  }

  loadEquiposTrabajo(idPeticionEvaluacion: number): void {
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
      });
    }
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteEquipos(),
      this.createEquipos()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete) {
          this.setChanges(false);
        }
      })
    );
  }

  /**
   * Añade un nuevo miembro al equipo investigador
   *
   * @param equipoTrabajo un equipoTrabajo
   */
  addEquipoTrabajo(equipoTrabajo: IEquipoTrabajo): void {
    const wrapped = new StatusWrapper<IEquipoTrabajo>(equipoTrabajo);
    wrapped.setCreated();
    const current = this.equiposTrabajo$.value;
    current.push(wrapped);
    this.equiposTrabajo$.next(current);
    this.setChanges(true);
    this.setComplete(true);
  }

  /**
   * Elimina un miembro del equipo investigador de la lista de equipos de trabajo y le añade a la de equipos de trabajo a eliminar.
   *
   * @param equipoTrabajo un equipoTrabajo
   */
  deleteEquipoTrabajo(equipoTrabajo: StatusWrapper<IEquipoTrabajo>): void {
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
  }

  /**
   * Devuelve un observable con el investigador actual como miembro del equipo de trabajo.
   *
   * @return observable con el investigador actual.
   */
  private getInvestigadorActual(): Observable<IEquipoTrabajo> {
    return this.personaFisicaService.getInformacionBasica(this.sgiAuthService.authStatus$?.getValue()?.userRefId)
      .pipe(
        map((persona: IPersona) => {
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
    if (this.deletedEquiposTrabajo.length === 0) {
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
    const createdEquipos = this.equiposTrabajo$.value.filter((equipo) => equipo.created);
    if (createdEquipos.length === 0) {
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
