import { ISolicitudProyectoEquipoSocio } from '@core/models/csp/solicitud-proyecto-equipo-socio';
import { Fragment } from '@core/services/action-service';
import { SolicitudProyectoEquipoSocioService } from '@core/services/csp/solicitud-proyecto-equipo-socio.service';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export class SolicitudProyectoSocioEquipoSocioFragment extends Fragment {
  proyectoEquipoSocios$ = new BehaviorSubject<StatusWrapper<ISolicitudProyectoEquipoSocio>[]>([]);

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private solicitudProyectoSocioService: SolicitudProyectoSocioService,
    private solicitudProyectoEquipoSocioService: SolicitudProyectoEquipoSocioService,
    private personaFisicaService: PersonaFisicaService,
    public readonly
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    if (this.getKey()) {
      const id = this.getKey() as number;
      this.subscriptions.push(
        this.solicitudProyectoSocioService.findAllSolicitudProyectoEquipoSocio(id).pipe(
          switchMap(result => {
            return from(result.items).pipe(
              mergeMap(solicitudProyectoEquipoSocio => {
                const personaRef = solicitudProyectoEquipoSocio.persona.personaRef;
                return this.personaFisicaService.getInformacionBasica(personaRef).pipe(
                  map(persona => {
                    solicitudProyectoEquipoSocio.persona = persona;
                    return solicitudProyectoEquipoSocio;
                  })
                );
              }),
              map(() => result)
            );
          }),
          map(response => response.items)
        ).subscribe(
          result => {
            this.proyectoEquipoSocios$.next(
              result.map(solicitudProyectoEquipoSocio =>
                new StatusWrapper<ISolicitudProyectoEquipoSocio>(solicitudProyectoEquipoSocio)
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

  addProyectoEquipoSocio(element: ISolicitudProyectoEquipoSocio): void {
    const wrapped = new StatusWrapper<ISolicitudProyectoEquipoSocio>(element);
    wrapped.setCreated();
    const current = this.proyectoEquipoSocios$.value;
    current.push(wrapped);
    this.proyectoEquipoSocios$.next(current);
    this.setChanges(true);
  }

  deleteProyectoEquipoSocio(wrapper: StatusWrapper<ISolicitudProyectoEquipoSocio>): void {
    const current = this.proyectoEquipoSocios$.value;
    const index = current.findIndex((value) => value === wrapper);
    if (index >= 0) {
      current.splice(index, 1);
      this.proyectoEquipoSocios$.next(current);
      this.setChanges(true);
    }
  }

  saveOrUpdate(): Observable<void> {
    const values = this.proyectoEquipoSocios$.value.map(wrapper => wrapper.value);
    const id = this.getKey() as number;
    return this.solicitudProyectoEquipoSocioService.updateList(id, values)
      .pipe(
        takeLast(1),
        map((results) => {
          this.proyectoEquipoSocios$.next(
            results.map(value => new StatusWrapper<ISolicitudProyectoEquipoSocio>(value)));
        }),
        tap(() => {
          if (this.isSaveOrUpdateComplete()) {
            this.setChanges(false);
          }
        })
      );
  }

  private isSaveOrUpdateComplete(): boolean {
    const hasTouched = this.proyectoEquipoSocios$.value.some((wrapper) => wrapper.touched);
    return !hasTouched;
  }
}
