import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoProrroga } from '@core/models/csp/proyecto-prorroga';
import { Fragment } from '@core/services/action-service';
import { ProyectoProrrogaService } from '@core/services/csp/proyecto-prorroga.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { DocumentoService } from '@core/services/sgdoc/documento.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export class ProyectoProrrogasFragment extends Fragment {
  prorrogas$ = new BehaviorSubject<StatusWrapper<IProyectoProrroga>[]>([]);
  private prorrogasEliminados: StatusWrapper<IProyectoProrroga>[] = [];

  constructor(
    key: number,
    private proyectoService: ProyectoService,
    private proyectoProrrogaService: ProyectoProrrogaService,
    private documentoService: DocumentoService
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    if (this.getKey()) {
      this.proyectoService.findAllProyectoProrrogaProyecto(this.getKey() as number).pipe(
        map((response) => response.items)
      ).subscribe((prorrogas) => {
        this.prorrogas$.next(prorrogas.map(
          periodoSeguimiento => new StatusWrapper<IProyectoProrroga>(periodoSeguimiento))
        );
      });
    }
  }

  public addProrroga(periodoSeguimiento: IProyectoProrroga) {
    const wrapped = new StatusWrapper<IProyectoProrroga>(periodoSeguimiento);
    wrapped.setCreated();
    const current = this.prorrogas$.value;
    current.push(wrapped);
    this.prorrogas$.next(current);
    this.setChanges(true);
  }

  public deleteProrroga(wrapper: StatusWrapper<IProyectoProrroga>) {
    const current = this.prorrogas$.value;
    const index = current.findIndex(
      (value) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.prorrogasEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.prorrogas$.next(current);
      this.setChanges(true);
    }
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteProrrogas(),
      this.updateProrrogas(),
      this.createProrrogas()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      })
    );
  }

  private deleteProrrogas(): Observable<void> {
    if (this.prorrogasEliminados.length === 0) {
      return of(void 0);
    }
    return from(this.prorrogasEliminados).pipe(
      mergeMap((wrapped) => {
        return this.proyectoProrrogaService.findDocumentos(wrapped.value.id).pipe(
          switchMap((documentos) => {
            return this.proyectoProrrogaService.deleteById(wrapped.value.id)
              .pipe(
                tap(() => {
                  this.prorrogasEliminados = this.prorrogasEliminados.filter(deletedProrroga =>
                    deletedProrroga.value.id !== wrapped.value.id),
                    map(() => {
                      return from(documentos.items).pipe(
                        mergeMap(documento => {
                          return this.documentoService.eliminarFichero(documento.documentoRef);
                        })
                      );
                    });
                }),
                takeLast(1)
              );
          })
        );
      })
    );
  }

  private createProrrogas(): Observable<void> {
    const createdProrrogas = this.prorrogas$.value.filter((proyectoProrroga) => proyectoProrroga.created);
    if (createdProrrogas.length === 0) {
      return of(void 0);
    }
    createdProrrogas.forEach(
      (wrapper) => wrapper.value.proyecto = {
        id: this.getKey(),
        activo: true
      } as IProyecto
    );
    return from(createdProrrogas).pipe(
      mergeMap((wrappedProrrogas) => {
        return this.proyectoProrrogaService.create(wrappedProrrogas.value).pipe(
          map((updatedProrrogas) => {
            const index = this.prorrogas$.value.findIndex((currentprorrogas) => currentprorrogas === wrappedProrrogas);
            this.prorrogas$.value[index] = new StatusWrapper<IProyectoProrroga>(updatedProrrogas);
          })
        );
      })
    );
  }

  private updateProrrogas(): Observable<void> {
    const updateProrrogas = this.prorrogas$.value.filter((proyectoProrroga) => proyectoProrroga.edited);
    if (updateProrrogas.length === 0) {
      return of(void 0);
    }
    return from(updateProrrogas).pipe(
      mergeMap((wrappedProrrogas) => {
        return this.proyectoProrrogaService.update(wrappedProrrogas.value.id, wrappedProrrogas.value).pipe(
          map((updatedProrrogas) => {
            const index = this.prorrogas$.value.findIndex((currentprorrogas) => currentprorrogas === wrappedProrrogas);
            this.prorrogas$.value[index] = new StatusWrapper<IProyectoProrroga>(updatedProrrogas);
          })
        );
      })
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.prorrogas$.value.some((wrapper) => wrapper.touched);
    return (this.prorrogasEliminados.length > 0 || touched);
  }

}
