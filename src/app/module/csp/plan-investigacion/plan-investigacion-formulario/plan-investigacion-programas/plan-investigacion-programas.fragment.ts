import { IPrograma } from '@core/models/csp/programa';
import { Fragment } from '@core/services/action-service';
import { ProgramaService } from '@core/services/csp/programa.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { concatMap, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export interface INodePrograma {
  parent: NodePrograma;
  programa: StatusWrapper<IPrograma>;
  readonly childs: NodePrograma[];
}

export class NodePrograma implements INodePrograma {
  parent: NodePrograma;
  programa: StatusWrapper<IPrograma>;
  // tslint:disable-next-line: variable-name
  _childs: NodePrograma[];
  get childs(): NodePrograma[] {
    return this._childs;
  }

  constructor(programa: StatusWrapper<IPrograma>) {
    this.programa = programa;
    this._childs = [];
  }

  addChild(child: NodePrograma) {
    child.parent = this;
    child.programa.value.padre = this.programa.value;
    this._childs.push(child);
    this.sortChildsByName();
  }

  removeChild(child: NodePrograma) {
    this._childs = this._childs.filter((programa) => programa !== child);
  }

  sortChildsByName(): void {
    this._childs = sortByName(this._childs);
  }
}

function sortByName(nodes: NodePrograma[]): NodePrograma[] {
  return nodes.sort((a, b) => {
    if (a.programa.value.nombre < b.programa.value.nombre) {
      return -1;
    }
    if (a.programa.value.nombre > b.programa.value.nombre) {
      return 1;
    }
    return 0;
  });
}

export class PlanInvestigacionProgramaFragment extends Fragment {
  programas$ = new BehaviorSubject<NodePrograma[]>([]);
  private programasEliminados: IPrograma[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private programaService: ProgramaService
  ) {
    super(key);
    this.logger.debug(PlanInvestigacionProgramaFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(PlanInvestigacionProgramaFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.onInitialize.name}()`, 'start');
    if (this.getKey()) {
      this.programaService.findAllHijosPrograma(this.getKey() as number).pipe(
        switchMap(response => {
          return from(response.items).pipe(
            mergeMap((programa) => {
              const node = new NodePrograma(new StatusWrapper<IPrograma>(programa));
              return this.getChilds(node).pipe(map(() => node));
            })
          );
        })
      ).subscribe(
        (programa) => {
          const current = this.programas$.value;
          current.push(programa);
          this.publishNodes(current);
        },
        (error) => {
          this.logger.error(PlanInvestigacionProgramaFragment.name, `${this.onInitialize.name}()`, error);
        }
      );
    }
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.onInitialize.name}()`, 'end');
  }

  publishNodes(rootNodes?: NodePrograma[]) {
    let nodes = rootNodes ? rootNodes : this.programas$.value;
    nodes = sortByName(nodes);
    this.programas$.next(nodes);
  }

  private getChilds(parent: NodePrograma): Observable<NodePrograma[]> {
    return this.programaService.findAllHijosPrograma(parent.programa.value.id).pipe(
      map((result) => {
        const childs: NodePrograma[] = result.items.map(
          (programa) => {
            const child = new NodePrograma(new StatusWrapper<IPrograma>(programa));
            child.parent = parent;
            return child;
          });
        return childs;
      }),
      switchMap((nodes) => {
        parent.childs.push(...nodes);
        parent.sortChildsByName();
        if (nodes.length > 0) {
          return from(nodes).pipe(
            mergeMap((node) => {
              return this.getChilds(node);
            })
          );
        }
        else {
          return of([]);
        }
      }),
      takeLast(1)
    );
  }

  public addToDelete(node: NodePrograma) {
    this.logger.debug(PlanInvestigacionProgramaFragment.name,
      `${this.addToDelete.name}(wrapper: ${node})`, 'start');
    if (!node.programa.created) {
      this.programasEliminados.push(node.programa.value);
    }
    node.childs.forEach((child) => {
      this.addToDelete(child);
    });
    this.logger.debug(PlanInvestigacionProgramaFragment.name,
      `${this.addToDelete.name}(wrapper: ${node})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteProgramas(),
      this.updateProgramas(this.getUpdated(this.programas$.value)),
      this.createProgramas(this.getCreated(this.programas$.value))
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete(this.programas$.value)) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private getUpdated(programas: NodePrograma[]): NodePrograma[] {
    const updated: NodePrograma[] = [];
    programas.forEach((node) => {
      if (node.programa.edited) {
        updated.push(node);
      }
      if (node.childs.length) {
        updated.push(...this.getUpdated(node.childs));
      }
    });
    return updated;
  }

  private getCreated(programas: NodePrograma[]): NodePrograma[] {
    const updated: NodePrograma[] = [];
    programas.forEach((node) => {
      if (node.programa.created) {
        updated.push(node);
      }
      if (node.childs.length) {
        updated.push(...this.getCreated(node.childs));
      }
    });
    return updated;
  }

  private deleteProgramas(): Observable<void> {
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.deleteProgramas.name}()`, 'start');
    if (this.programasEliminados.length === 0) {
      this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.deleteProgramas.name}()`, 'end');
      return of(void 0);
    }
    return from(this.programasEliminados).pipe(
      mergeMap((programa) => {
        return this.programaService.deactivate(programa.id)
          .pipe(
            tap(() => {
              this.programasEliminados = this.programasEliminados.filter(deleted =>
                deleted.id !== programa.id);
            }),
            tap(() => this.logger.debug(PlanInvestigacionProgramaFragment.name,
              `${this.deleteProgramas.name}()`, 'end'))
          );
      }));
  }

  private updateProgramas(nodes: NodePrograma[]): Observable<void> {
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.updateProgramas.name}()`, 'start');
    if (nodes.length === 0) {
      this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.updateProgramas.name}()`, 'end');
      return of(void 0);
    }
    return from(nodes).pipe(
      mergeMap((node) => {
        return this.programaService.update(node.programa.value.id, node.programa.value).pipe(
          map((updated) => {
            node.programa = new StatusWrapper<IPrograma>(updated);
          }),
          tap(() => this.logger.debug(PlanInvestigacionProgramaFragment.name,
            `${this.updateProgramas.name}()`, 'end'))
        );
      }));
  }

  private createProgramas(nodes: NodePrograma[]): Observable<void> {
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.createProgramas.name}()`, 'start');
    if (nodes.length === 0) {
      this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.createProgramas.name}()`, 'end');
      return of(void 0);
    }
    return from(nodes).pipe(
      concatMap(node => {
        //Root nodes must match entity parent
        if (!node.parent) {
          node.programa.value.padre.id = this.getKey() as number;
        }
        return this.programaService.create(node.programa.value).pipe(
          map(created => {
            node.programa = new StatusWrapper<IPrograma>(created);
            node.childs.forEach((child) => {
              child.programa.value.padre = created;
            });
          }),
          tap(() => this.logger.debug(PlanInvestigacionProgramaFragment.name,
            `${this.createProgramas.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(nodes: NodePrograma[]): boolean {
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    let pending = this.programasEliminados.length > 0;
    if (pending) {
      return false;
    }
    nodes.forEach((node) => {
      pending = pending || node.programa.touched;
      if (pending) {
        return false;
      }
      if (node.childs.length) {
        pending = pending || this.isSaveOrUpdateComplete(node.childs);
        if (pending) {
          return false;
        }
      }
    });
    this.logger.debug(PlanInvestigacionProgramaFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return true;
  }

}
