import { IProyectoEntidadFinanciadora } from '@core/models/csp/proyecto-entidad-financiadora';
import { Fragment } from '@core/services/action-service';
import { ProyectoEntidadFinanciadoraService } from '@core/services/csp/proyecto-entidad-financiadora.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { EmpresaService } from '@core/services/sgemp/empresa.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';

export class ProyectoEntidadesFinanciadorasFragment extends Fragment {
  entidadesPropias$ = new BehaviorSubject<StatusWrapper<IProyectoEntidadFinanciadora>[]>([]);
  entidadesAjenas$ = new BehaviorSubject<StatusWrapper<IProyectoEntidadFinanciadora>[]>([]);
  private entidadesEliminadas: StatusWrapper<IProyectoEntidadFinanciadora>[] = [];

  constructor(
    key: number,
    private proyectoService: ProyectoService,
    private proyectoEntidadFinanciadoraService: ProyectoEntidadFinanciadoraService,
    private empresaService: EmpresaService,
    public readonly: boolean
  ) {
    super(key);
    this.setComplete(true);
  }

  protected onInitialize(): void {
    if (this.getKey()) {
      const subscription =
        merge(
          this.proyectoService.findEntidadesFinanciadorasPropias(this.getKey() as number).pipe(
            map(response => {
              return response.items.map(entidad => new StatusWrapper<IProyectoEntidadFinanciadora>(entidad));
            }),
            tap((value) => {
              this.entidadesPropias$.next(value);
            }),
            mergeMap(entidades => this.fillEmpresa(entidades)),
          ),
          this.proyectoService.findEntidadesFinanciadorasAjenas(this.getKey() as number).pipe(
            map(response => {
              return response.items.map(entidad => new StatusWrapper<IProyectoEntidadFinanciadora>(entidad));
            }),
            tap((value) => {
              this.entidadesAjenas$.next(value);
            }),
            mergeMap(entidades => this.fillEmpresa(entidades)),
          ),
        ).subscribe();
      this.subscriptions.push(subscription);
    }
  }

  private fillEmpresa(entidades: StatusWrapper<IProyectoEntidadFinanciadora>[]):
    Observable<StatusWrapper<IProyectoEntidadFinanciadora>> {
    return from(entidades).pipe(
      mergeMap(entidad => {
        return this.empresaService.findById(entidad.value.empresa.id).pipe(
          map((empresa) => {
            entidad.value.empresa = empresa;
            return entidad;
          })
        );
      }),
    );
  }

  public deleteEntidadFinanciadora(wrapper: StatusWrapper<IProyectoEntidadFinanciadora>, targetPropias: boolean) {
    const current = targetPropias ? this.entidadesPropias$.value : this.entidadesAjenas$.value;
    const index = current.findIndex(value => value.value.id === wrapper.value.id);
    if (index >= 0) {
      if (!wrapper.created) {
        this.entidadesEliminadas.push(current[index]);
      }
      current.splice(index, 1);
      targetPropias ? this.entidadesPropias$.next(current) : this.entidadesAjenas$.next(current);
      this.setChanges(true);
    }
  }

  public updateEntidadFinanciadora(wrapper: StatusWrapper<IProyectoEntidadFinanciadora>, targetPropias: boolean) {
    const current = targetPropias ? this.entidadesPropias$.value : this.entidadesAjenas$.value;
    const index = current.findIndex(value => value.value.id === wrapper.value.id);
    if (index >= 0) {
      wrapper.setEdited();
      targetPropias ?
        this.entidadesPropias$.value[index] = wrapper :
        this.entidadesAjenas$.value[index] = wrapper;
      this.setChanges(true);
    }
  }

  public addEntidadFinanciadora(entidadFinanciadora: IProyectoEntidadFinanciadora, targetPropias: boolean) {
    const wrapped = new StatusWrapper<IProyectoEntidadFinanciadora>(entidadFinanciadora);
    wrapped.value.ajena = !targetPropias;
    wrapped.setCreated();
    if (targetPropias) {
      const current = this.entidadesPropias$.value;
      current.push(wrapped);
      this.entidadesPropias$.next(current);
    }
    else {
      const current = this.entidadesAjenas$.value;
      current.push(wrapped);
      this.entidadesAjenas$.next(current);
    }
    this.setChanges(true);
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteProyectoEntidadFinanciadoras(),
      this.updateProyectoEntidadFinanciadoras(this.entidadesPropias$),
      this.updateProyectoEntidadFinanciadoras(this.entidadesAjenas$),
      this.createProyectoEntidadFinanciadoras(this.entidadesPropias$),
      this.createProyectoEntidadFinanciadoras(this.entidadesAjenas$),
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      })
    );
  }

  private deleteProyectoEntidadFinanciadoras(): Observable<void> {
    const deleted = this.entidadesEliminadas.filter((value) => value.value.id);
    if (deleted.length === 0) {
      return of(void 0);
    }
    return from(deleted).pipe(
      mergeMap((wrapped) => {
        return this.proyectoEntidadFinanciadoraService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.entidadesEliminadas = deleted.filter(entidad => entidad.value.id !== wrapped.value.id);
            })
          );
      })
    );
  }

  private updateProyectoEntidadFinanciadoras(target$: BehaviorSubject<StatusWrapper<IProyectoEntidadFinanciadora>[]>): Observable<void> {
    const edited = target$.value.filter((value) => value.edited);
    if (edited.length === 0) {
      return of(void 0);
    }
    return from(edited).pipe(
      mergeMap((wrapped) => {
        return this.proyectoEntidadFinanciadoraService.update(wrapped.value.id, wrapped.value).pipe(
          map((update) => {
            const index = target$.value.findIndex((current) => current === wrapped);
            target$.value[index] = new StatusWrapper<IProyectoEntidadFinanciadora>(update);
          })
        );
      })
    );
  }

  private createProyectoEntidadFinanciadoras(target$: BehaviorSubject<StatusWrapper<IProyectoEntidadFinanciadora>[]>): Observable<void> {
    const created = target$.value.filter((value) => value.created);
    if (created.length === 0) {
      return of(void 0);
    }
    created.forEach(
      (wrapper) => wrapper.value.proyectoId = this.getKey() as number
    );
    return from(created).pipe(
      mergeMap((wrapped) => {
        return this.proyectoEntidadFinanciadoraService.create(wrapped.value).pipe(
          map((update) => {
            const index = target$.value.findIndex((current) => current === wrapped);
            target$[index] = new StatusWrapper<IProyectoEntidadFinanciadora>(update);
          })
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched = this.entidadesPropias$.value.some((wrapper) => wrapper.touched) ||
      this.entidadesAjenas$.value.some((wrapper) => wrapper.touched);
    return (this.entidadesEliminadas.length > 0 || touched);
  }
}
