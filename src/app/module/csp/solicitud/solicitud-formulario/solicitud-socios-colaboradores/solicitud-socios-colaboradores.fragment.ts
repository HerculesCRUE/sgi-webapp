import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { Fragment } from '@core/services/action-service';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';

export class SolicitudSociosColaboradoresFragment extends Fragment {
  proyectoSocios$ = new BehaviorSubject<StatusWrapper<ISolicitudProyectoSocio>[]>([]);
  private sociosEliminados: StatusWrapper<ISolicitudProyectoSocio>[] = [];

  isSociosColaboradores = false;
  enableAddSocioColaborador = false;

  constructor(
    key: number,
    private solicitudService: SolicitudService,
    private solicitudProyectoSocioService: SolicitudProyectoSocioService,
    private empresaEconomicaService: EmpresaEconomicaService,
    public readonly
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    const id = this.getKey() as number;
    if (id) {
      const subscription = this.solicitudService.findAllSolicitudProyectoSocio(id).pipe(
        switchMap((proyectoSocios) =>
          from(proyectoSocios).pipe(
            mergeMap((proyectoSocio) =>
              this.empresaEconomicaService.findById(proyectoSocio.empresa.personaRef).pipe(
                tap(empresaEconomica => proyectoSocio.empresa = empresaEconomica),
                catchError(() => of())
              )
            ),
            map(() => proyectoSocios)
          )
        ),
        map(results => results.map(
          proyectoSocio => new StatusWrapper<ISolicitudProyectoSocio>(proyectoSocio))),
      ).subscribe(
        (result) => {
          this.proyectoSocios$.next(result);
        }
      );
      this.subscriptions.push(subscription);
    }
  }

  public deleteProyectoSocio(wrapper: StatusWrapper<ISolicitudProyectoSocio>) {
    const current = this.proyectoSocios$.value;
    const index = current.findIndex((value) => value === wrapper);
    if (index >= 0) {
      if (!wrapper.created) {
        this.sociosEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.proyectoSocios$.next(current);
      this.setChanges(true);
    }
  }

  saveOrUpdate(): Observable<void> {
    return this.deleteProyectoSocios();
  }

  private deleteProyectoSocios(): Observable<void> {
    if (this.sociosEliminados.length === 0) {
      return of(void 0);
    }
    return from(this.sociosEliminados).pipe(
      mergeMap((wrapped) => {
        return this.solicitudProyectoSocioService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.sociosEliminados = this.sociosEliminados.filter(deletedEnlace =>
                deletedEnlace.value.id !== wrapped.value.id);
            })
          );
      })
    );
  }
}
