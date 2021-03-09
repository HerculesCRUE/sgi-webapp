import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { IMemoria } from '@core/models/eti/memoria';
import { ITarea } from '@core/models/eti/tarea';
import { Fragment } from '@core/services/action-service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { TareaService } from '@core/services/eti/tarea.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';
import { EquipoInvestigadorListadoFragment } from '../../equipo-investigador/equipo-investigador-listado/equipo-investigador-listado.fragment';
import { MemoriasListadoFragment } from '../../memorias-listado/memorias-listado.fragment';
export class PeticionEvaluacionTareasFragment extends Fragment {

  tareas$: BehaviorSubject<StatusWrapper<ITarea>[]> = new BehaviorSubject<StatusWrapper<ITarea>[]>([]);

  private deletedTareas: StatusWrapper<ITarea>[] = [];
  equiposTrabajo: IEquipoTrabajo[] = [];
  memorias: IMemoria[] = [];

  constructor(
    key: number,
    private personaFisicaService: PersonaFisicaService,
    private tareaService: TareaService,
    private peticionEvaluacionService: PeticionEvaluacionService,
    private equipoInvestigadorFragment: EquipoInvestigadorListadoFragment,
    private memoriaFragment: MemoriasListadoFragment) {
    super(key);
    this.setComplete(true);
  }

  onInitialize(): void {
    this.equipoInvestigadorFragment.initialize();
    this.memoriaFragment.initialize();
    if (this.getKey()) {
      this.loadTareas(this.getKey() as number);
    }
  }

  setEquiposTrabajo(equiposTrabajo: IEquipoTrabajo[]) {
    this.equiposTrabajo = equiposTrabajo;
  }

  setMemorias(memorias: IMemoria[]) {
    this.memorias = memorias;
  }

  loadTareas(idPeticionEvaluacion: number): void {
    this.peticionEvaluacionService.findTareas(idPeticionEvaluacion).pipe(
      map((response) => {
        if (response.items) {
          response.items.forEach((tarea) => {
            this.personaFisicaService.getInformacionBasica(tarea.equipoTrabajo.personaRef).pipe(
              map((usuarioInfo) => {
                tarea.equipoTrabajo.identificadorNumero = usuarioInfo.identificadorNumero;
                tarea.equipoTrabajo.nombre = usuarioInfo.nombre;
                tarea.equipoTrabajo.primerApellido = usuarioInfo.primerApellido;
                tarea.equipoTrabajo.segundoApellido = usuarioInfo.segundoApellido;
              })
            ).subscribe();
          });
          return response.items.map((tarea) => new StatusWrapper<ITarea>(tarea));
        }
        else {
          return [];
        }
      })
    ).subscribe((tareas) => {
      this.tareas$.next(tareas);
    });
  }

  /**
   * Añade una nueva tarea
   *
   * @param tarea una tarea
   */
  addTarea(tarea: ITarea): void {
    const wrapped = new StatusWrapper<ITarea>(tarea);
    wrapped.setCreated();
    const current = this.tareas$.value;
    current.push(wrapped);
    this.tareas$.next(current);
    this.setChanges(true);
    this.setComplete(true);
  }

  /**
   * Elimina una tarea de la lista de tareas y la añade a la de tareas a eliminar.
   *
   * @param tarea una tarea
   */
  deleteTarea(tarea: StatusWrapper<ITarea>): void {
    const current = this.tareas$.value;
    const index = current.findIndex((value) => value === tarea);
    if (index >= 0) {
      if (!tarea.created) {
        current[index].setDeleted();
        this.deletedTareas.push(current[index]);
      }
      current.splice(index, 1);
      this.tareas$.next(current);
      this.setChanges(true);
    }
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteTareas(),
      this.updateTareas(),
      this.createTareas()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      })
    );
  }

  /**
   * Elimina las tareas del equipo de trabajo.
   *
   * @param wrapperEquipoTrabajo un equipoTrabajo.
   */
  deleteTareasEquipoTrabajo(wrapperEquipoTrabajo: StatusWrapper<IEquipoTrabajo>): void {
    const current = this.tareas$.value;

    const currentWithoutTareasEquipoTrabajo = current.filter((wrapper) =>
      wrapper.value.equipoTrabajo.personaRef !== wrapperEquipoTrabajo.value.personaRef
    );

    if (currentWithoutTareasEquipoTrabajo.length !== current.length) {
      this.tareas$.next(currentWithoutTareasEquipoTrabajo);

      const hasChanges = currentWithoutTareasEquipoTrabajo.some((wrapper) => wrapper.touched);
      this.setChanges(hasChanges);
    }
  }

  private deleteTareas(): Observable<void> {
    if (this.deletedTareas.length === 0) {
      return of(void 0);
    }
    return from(this.deletedTareas).pipe(
      mergeMap((wrappedTarea) => {
        return this.peticionEvaluacionService
          .deleteTareaPeticionEvaluacion(this.getKey() as number, wrappedTarea.value.equipoTrabajo.id, wrappedTarea.value.id)
          .pipe(
            tap(_ => {
              this.deletedTareas = this.deletedTareas.filter(deletedTarea =>
                deletedTarea.value.id !== wrappedTarea.value.id);
            })
          );
      }));
  }

  private updateTareas(): Observable<void> {
    const editedTareas = this.tareas$.value.filter((tarea) => tarea.edited);
    if (editedTareas.length === 0) {
      return of(void 0);
    }

    return from(editedTareas).pipe(
      mergeMap((wrappedTarea) => {
        return this.tareaService.update(wrappedTarea.value.id, wrappedTarea.value).pipe(
          map((updatedTarea) => {
            const index = this.tareas$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
            this.tareas$[index] = new StatusWrapper<ITarea>(updatedTarea);
          })
        );
      }));
  }

  private createTareas(): Observable<void> {
    const createdTareas = this.tareas$.value.filter((tarea) => tarea.created);
    if (createdTareas.length === 0) {
      return of(void 0);
    }

    return from(createdTareas).pipe(
      mergeMap((wrappedTarea) => {
        wrappedTarea.value.equipoTrabajo = this.equiposTrabajo.find(
          equipo => equipo.personaRef === wrappedTarea.value.equipoTrabajo.personaRef);

        const idEquipoTrabajo = wrappedTarea.value.equipoTrabajo.id;

        return this.peticionEvaluacionService.createTarea(this.getKey() as number,
          idEquipoTrabajo, wrappedTarea.value).pipe(
            map((savedTarea) => {
              const index = this.tareas$.value.findIndex((currentTarea) => currentTarea === wrappedTarea);
              this.tareas$[index] = new StatusWrapper<ITarea>(savedTarea);
            })
          );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.tareas$.value.some((wrapper) => wrapper.touched);
    if (this.deletedTareas.length > 0 || touched) {
      return false;
    }
    return true;
  }

}
