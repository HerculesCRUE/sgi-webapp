import { IProyectoEquipo } from '@core/models/csp/proyecto-equipo';
import { Fragment } from '@core/services/action-service';
import { ProyectoEquipoService } from '@core/services/csp/proyecto-equipo.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export class ProyectoEquipoFragment extends Fragment {
  equipos$ = new BehaviorSubject<StatusWrapper<IProyectoEquipo>[]>([]);

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private proyectoService: ProyectoService,
    private proyectoEquipoService: ProyectoEquipoService,
    private personaFisicaService: PersonaFisicaService
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    if (this.getKey()) {
      const id = this.getKey() as number;
      this.subscriptions.push(
        this.proyectoService.findAllProyectoEquipo(id).pipe(
          switchMap(result => {
            return from(result.items).pipe(
              mergeMap(element => {
                const personaRef = element.persona.personaRef;
                return this.personaFisicaService.getInformacionBasica(personaRef).pipe(
                  map(persona => {
                    element.persona = persona;
                    return element;
                  })
                );
              }),
              map(() => result)
            );
          }),
          map(response => response.items)
        ).subscribe(
          result => {
            this.equipos$.next(
              result.map(solicitudProyectoEquipo =>
                new StatusWrapper<IProyectoEquipo>(solicitudProyectoEquipo)
              )
            );
          },
          error => {
            this.logger.error(error);
          }
        )
      );
    }
  }

  addProyectoEquipo(element: IProyectoEquipo) {
    const wrapped = new StatusWrapper<IProyectoEquipo>(element);
    wrapped.setCreated();
    const current = this.equipos$.value;
    current.push(wrapped);
    this.equipos$.next(current);
    this.setChanges(true);
  }

  deleteProyectoEquipo(wrapper: StatusWrapper<IProyectoEquipo>) {
    const current = this.equipos$.value;
    const index = current.findIndex((value) => value === wrapper);
    if (index >= 0) {
      current.splice(index, 1);
      this.equipos$.next(current);
      this.setChanges(true);
    }
  }

  saveOrUpdate(): Observable<void> {
    const values = this.equipos$.value.map(wrapper => wrapper.value);
    const id = this.getKey() as number;
    return this.proyectoEquipoService.updateList(id, values)
      .pipe(
        takeLast(1),
        map((results) => {
          this.equipos$.next(
            results.map(value => new StatusWrapper<IProyectoEquipo>(value)));
        }),
        tap(() => {
          if (this.isSaveOrUpdateComplete()) {
            this.setChanges(false);
          }
        })
      );
  }

  private isSaveOrUpdateComplete(): boolean {
    const hasTouched = this.equipos$.value.some((wrapper) => wrapper.touched);
    return !hasTouched;
  }
}
