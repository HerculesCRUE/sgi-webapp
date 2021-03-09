import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { Fragment } from '@core/services/action-service';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';


export class ConvocatoriaReunionAsignacionMemoriasListadoFragment extends Fragment {

  evaluaciones$: BehaviorSubject<StatusWrapper<IEvaluacion>[]> = new BehaviorSubject<StatusWrapper<IEvaluacion>[]>([]);
  private deleted: StatusWrapper<IEvaluacion>[] = [];
  private convocatoriaReunion: IConvocatoriaReunion;

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private service: EvaluacionService,
    private personaFisicaService: PersonaFisicaService,
    private convocatoriaReunionService: ConvocatoriaReunionService
  ) {
    super(key);

    // Para que permita crear convocatorias sin memorias asignadas
    this.setComplete(true);
  }

  onInitialize(): void {
    if (this.getKey()) {
      this.loadEvaluaciones(this.getKey() as number);
    }
  }

  setConvocatoriaReunion(value: IConvocatoriaReunion) {
    if (!value || value.id !== this.getKey()) {
      Error('Value mistmatch');
    }
    this.convocatoriaReunion = value;
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteEvaluaciones(),
      this.createEvaluaciones(),
      this.updateEvaluaciones()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }
      )
    );
  }

  public addEvaluacion(evaluacion: IEvaluacion) {
    const wrapped = new StatusWrapper<IEvaluacion>(evaluacion);
    wrapped.setCreated();
    const current = this.evaluaciones$.value;
    current.push(wrapped);
    this.evaluaciones$.next(current);
    this.setChanges(true);
    // Como no es obligario tener memorias asignadas no aplica.
    // this.setComplete(true);
  }

  public deleteEvaluacion(evaluacion: StatusWrapper<IEvaluacion>) {
    const current = this.evaluaciones$.value;
    const index = current.findIndex((value) => value === evaluacion);
    if (index >= 0) {
      if (!evaluacion.created) {
        this.deleted.push(current[index]);
      }
      current.splice(index, 1);
      this.evaluaciones$.next(current);
      this.setChanges(true);
    }
    // Como no es obligario tener memorias asignadas no aplica.
    // if (current.length === 0) {
    //   this.setComplete(false);
    // }
  }

  private loadEvaluaciones(idConvocatoria: number): void {
    this.service
      .findAllByConvocatoriaReunionIdAndNoEsRevMinima(
        idConvocatoria
      ).pipe(
        map((response) => {
          // Return the values
          return response.items;
        }),
        switchMap((evaluaciones) => {
          if (!evaluaciones || evaluaciones.length === 0) {
            return of([]);
          }

          const personaRefsEvaluadores = new Set<string>();

          evaluaciones.forEach((evaluacion: IEvaluacion) => {
            personaRefsEvaluadores.add(evaluacion?.evaluador1?.personaRef);
            personaRefsEvaluadores.add(evaluacion?.evaluador2?.personaRef);
          });

          return this.personaFisicaService.findByPersonasRefs([...personaRefsEvaluadores]).pipe(
            map((result) => {
              const personas = result.items;

              evaluaciones.forEach((evaluacion: IEvaluacion) => {
                const datosPersonaEvaluador1 = personas.find((persona) =>
                  evaluacion.evaluador1.personaRef === persona.personaRef);
                evaluacion.evaluador1.nombre = datosPersonaEvaluador1?.nombre;
                evaluacion.evaluador1.primerApellido = datosPersonaEvaluador1?.primerApellido;
                evaluacion.evaluador1.segundoApellido = datosPersonaEvaluador1?.segundoApellido;

                const datosPersonaEvaluador2 = personas.find((persona) =>
                  evaluacion.evaluador2.personaRef === persona.personaRef);
                evaluacion.evaluador2.nombre = datosPersonaEvaluador2?.nombre;
                evaluacion.evaluador2.primerApellido = datosPersonaEvaluador2?.primerApellido;
                evaluacion.evaluador2.segundoApellido = datosPersonaEvaluador2?.segundoApellido;
              });

              return evaluaciones;
            }));
        }),
        catchError((error) => {
          // On error reset pagination values
          // this.snackBarService.showError('eti.convocatoriaReunion.listado.error');
          this.logger.error(error);
          return of([]);
        })
      ).subscribe(
        (evaluaciones) => {
          this.evaluaciones$.next(evaluaciones.map((ev) => new StatusWrapper<IEvaluacion>(ev)));
        }
      );
  }

  private createEvaluaciones(): Observable<void> {
    const evaluacionesCreadas = this.evaluaciones$.value.filter((evaluacion) => evaluacion.created);
    if (evaluacionesCreadas.length === 0) {
      return of(void 0);
    }
    return from(evaluacionesCreadas).pipe(
      mergeMap((evaluacion) => {
        evaluacion.value.convocatoriaReunion.id = this.getKey() as number;
        return this.service.create(evaluacion.value).pipe(
          map((savedEvaluacion) => {
            const index = this.evaluaciones$.value.findIndex((wrapped) => wrapped === evaluacion);
            this.evaluaciones$[index] = new StatusWrapper<IEvaluacion>(savedEvaluacion);
          })
        );
      }),
      takeLast(1)
    );
  }

  private updateEvaluaciones(): Observable<void> {
    const evaluacionesEditadas = this.evaluaciones$.value.filter((evaluacion) => evaluacion.edited);
    if (evaluacionesEditadas.length === 0) {
      return of(void 0);
    }
    return from(evaluacionesEditadas).pipe(
      mergeMap((evaluacion) => {
        evaluacion.value.convocatoriaReunion.id = this.getKey() as number;
        return this.service.update(evaluacion.value.id, evaluacion.value).pipe(
          map((updatedEvaluacion) => {
            const index = this.evaluaciones$.value.findIndex((wrapped) => wrapped === evaluacion);
            this.evaluaciones$[index] = new StatusWrapper<IEvaluacion>(updatedEvaluacion);
          })
        );
      }),
      takeLast(1)
    );
  }

  private deleteEvaluaciones(): Observable<void> {
    if (this.deleted.length === 0) {
      return of(void 0);
    }
    return from(this.deleted).pipe(
      mergeMap((wrappedEvaluacion) => {
        return this.convocatoriaReunionService
          .deleteEvaluacion(wrappedEvaluacion.value).pipe(
            map(_ => {
              this.deleted = this.deleted.filter(deleted => deleted.value.id !== wrappedEvaluacion.value.id);
            })
          );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.evaluaciones$.value.some((wrapper) => wrapper.touched);
    if (this.deleted.length > 0 || touched) {
      return false;
    }
    return true;
  }
}
