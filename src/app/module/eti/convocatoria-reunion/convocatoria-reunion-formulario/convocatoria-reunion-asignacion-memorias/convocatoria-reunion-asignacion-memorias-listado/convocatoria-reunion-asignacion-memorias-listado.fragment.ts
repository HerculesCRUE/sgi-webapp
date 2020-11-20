import { Fragment } from '@core/services/action-service';
import { Observable, of, BehaviorSubject, from, merge } from 'rxjs';
import { map, switchMap, catchError, mergeMap, takeLast, tap } from 'rxjs/operators';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { TipoEvaluacion } from '@core/models/eti/tipo-evaluacion';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';


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
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'onInitialize()', 'start');
    if (this.getKey()) {
      this.loadEvaluaciones(this.getKey() as number);
    }
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'onInitialize()', 'end');
  }

  setConvocatoriaReunion(value: IConvocatoriaReunion) {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'setConvocatoriaReunion(value: IConvocatoriaReunion)', 'start');
    if (!value || value.id !== this.getKey()) {
      Error('Value mistmatch');
    }
    this.convocatoriaReunion = value;
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'setConvocatoriaReunion(value: IConvocatoriaReunion)', 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'saveOrUpdate()', 'start');
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
      ),
      tap(() => this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'saveOrUpdate()', 'end'))
    );
  }

  public addEvaluacion(evaluacion: IEvaluacion) {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'addEvaluacion(evaluacion: IEvaluacion)', 'start');
    const wrapped = new StatusWrapper<IEvaluacion>(evaluacion);
    wrapped.setCreated();
    const current = this.evaluaciones$.value;
    current.push(wrapped);
    this.evaluaciones$.next(current);
    this.setChanges(true);
    // Como no es obligario tener memorias asignadas no aplica.
    // this.setComplete(true);
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'addEvaluacion(evaluacion: IEvaluacion)', 'end');
  }

  public deleteEvaluacion(evaluacion: StatusWrapper<IEvaluacion>) {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'deleteEvaluacion(evaluacion: StatusWrapper<IEvaluacion>)', 'start');
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
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'deleteEvaluacion(evaluacion: StatusWrapper<IEvaluacion>)', 'end');
  }

  private loadEvaluaciones(idConvocatoria: number): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'loadEvaluaciones(idConvocatoria: number)', 'start');
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
        catchError(() => {
          // On error reset pagination values
          // this.snackBarService.showError('eti.convocatoriaReunion.listado.error');
          this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'loadEvaluaciones(idConvocatoria: number)', 'end');
          return of([]);
        })
      ).subscribe(
        (evaluaciones) => {
          this.evaluaciones$.next(evaluaciones.map((ev) => new StatusWrapper<IEvaluacion>(ev)));
          this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'loadEvaluaciones(idConvocatoria: number)', 'end');
        }
      );
  }

  private createEvaluaciones(): Observable<void> {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'createEvaluacion()', 'start');
    const evaluacionesCreadas = this.evaluaciones$.value.filter((evaluacion) => evaluacion.created);
    if (evaluacionesCreadas.length === 0) {
      this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'createEvaluacion()', 'end');
      return of(void 0);
    }
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'createEvaluacion()', 'end');
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
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'createEvaluacion()', 'start');
    const evaluacionesEditadas = this.evaluaciones$.value.filter((evaluacion) => evaluacion.edited);
    if (evaluacionesEditadas.length === 0) {
      this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'createEvaluacion()', 'end');
      return of(void 0);
    }
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'createEvaluacion()', 'end');
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
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'deleteEvaluaciones()', 'start');
    if (this.deleted.length === 0) {
      this.logger.debug(ConvocatoriaReunionAsignacionMemoriasListadoFragment.name, 'deleteEvaluaciones()', 'end');
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
