import { IAreaTematica } from '@core/models/csp/area-tematica';
import { Fragment } from '@core/services/action-service';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { concatMap, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export interface INodeArea {
  parent: NodeArea;
  area: StatusWrapper<IAreaTematica>;
  readonly childs: NodeArea[];
}

export class NodeArea implements INodeArea {
  parent: NodeArea;
  area: StatusWrapper<IAreaTematica>;
  // tslint:disable-next-line: variable-name
  _childs: NodeArea[];
  get childs(): NodeArea[] {
    return this._childs;
  }

  constructor(area: StatusWrapper<IAreaTematica>) {
    this.area = area;
    this._childs = [];
  }

  addChild(child: NodeArea) {
    child.parent = this;
    child.area.value.padre = this.area.value;
    this._childs.push(child);
    this.sortChildsByName();
  }


  removeChild(child: NodeArea) {
    this._childs = this._childs.filter((area) => area !== child);
  }

  sortChildsByName(): void {
    this._childs = sortByName(this._childs);
  }
}

function sortByName(nodes: NodeArea[]): NodeArea[] {
  return nodes.sort((a, b) => {
    if (a.area.value.nombre < b.area.value.nombre) {
      return -1;
    }
    if (a.area.value.nombre > b.area.value.nombre) {
      return 1;
    }
    return 0;
  });
}

export class AreaTematicaArbolFragment extends Fragment {
  areas$ = new BehaviorSubject<NodeArea[]>([]);
  private areasEliminados: IAreaTematica[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private areaTematicaService: AreaTematicaService
  ) {
    super(key);
    this.logger.debug(AreaTematicaArbolFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(AreaTematicaArbolFragment.name, 'constructor()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.onInitialize.name}()`, 'start');
    if (this.getKey()) {
      this.areaTematicaService.findAllHijosArea(this.getKey() as number).pipe(
        switchMap(response => {
          return from(response.items).pipe(
            mergeMap((area) => {
              const node = new NodeArea(new StatusWrapper<IAreaTematica>(area));
              return this.getChilds(node).pipe(map(() => node));
            })
          );
        })
      ).subscribe(
        (area) => {
          const current = this.areas$.value;
          current.push(area);
          this.publishNodes(current);
        },
        (error) => {
          this.logger.error(AreaTematicaArbolFragment.name, `${this.onInitialize.name}()`, error);
        }
      );
    }
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.onInitialize.name}()`, 'end');
  }

  publishNodes(rootNodes?: NodeArea[]) {
    let nodes = rootNodes ? rootNodes : this.areas$.value;
    nodes = sortByName(nodes);
    this.areas$.next(nodes);
  }

  private getChilds(parent: NodeArea): Observable<NodeArea[]> {
    return this.areaTematicaService.findAllHijosArea(parent.area.value.id).pipe(
      map((result) => {
        const childs: NodeArea[] = result.items.map(
          (area) => {
            const child = new NodeArea(new StatusWrapper<IAreaTematica>(area));
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

  public addToDelete(node: NodeArea) {
    this.logger.debug(AreaTematicaArbolFragment.name,
      `${this.addToDelete.name}(wrapper: ${node})`, 'start');
    if (!node.area.created) {
      this.areasEliminados.push(node.area.value);
    }
    node.childs.forEach((child) => {
      this.addToDelete(child);
    });
    this.logger.debug(AreaTematicaArbolFragment.name,
      `${this.addToDelete.name}(wrapper: ${node})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    return merge(
      this.deleteAreas(),
      this.updateAreas(this.getUpdated(this.areas$.value)),
      this.createAreas(this.getCreated(this.areas$.value))
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete(this.areas$.value)) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(AreaTematicaArbolFragment.name, `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private getUpdated(areas: NodeArea[]): NodeArea[] {
    const updated: NodeArea[] = [];
    areas.forEach((node) => {
      if (node.area.edited) {
        updated.push(node);
      }
      if (node.childs.length) {
        updated.push(...this.getUpdated(node.childs));
      }
    });
    return updated;
  }

  private getCreated(areas: NodeArea[]): NodeArea[] {
    const updated: NodeArea[] = [];
    areas.forEach((node) => {
      if (node.area.created) {
        updated.push(node);
      }
      if (node.childs.length) {
        updated.push(...this.getCreated(node.childs));
      }
    });
    return updated;
  }

  private deleteAreas(): Observable<void> {
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.deleteAreas.name}()`, 'start');
    if (this.areasEliminados.length === 0) {
      this.logger.debug(AreaTematicaArbolFragment.name, `${this.deleteAreas.name}()`, 'end');
      return of(void 0);
    }
    return from(this.areasEliminados).pipe(
      mergeMap((area) => {
        return this.areaTematicaService.desactivar(area.id)
          .pipe(
            tap(() => {
              this.areasEliminados = this.areasEliminados.filter(deleted =>
                deleted.id !== area.id);
            }),
            tap(() => this.logger.debug(AreaTematicaArbolFragment.name,
              `${this.deleteAreas.name}()`, 'end'))
          );
      }));
  }

  private updateAreas(nodes: NodeArea[]): Observable<void> {
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.updateAreas.name}()`, 'start');
    if (nodes.length === 0) {
      this.logger.debug(AreaTematicaArbolFragment.name, `${this.updateAreas.name}()`, 'end');
      return of(void 0);
    }
    return from(nodes).pipe(
      mergeMap((node) => {
        return this.areaTematicaService.update(node.area.value.id, node.area.value).pipe(
          map((updated) => {
            node.area = new StatusWrapper<IAreaTematica>(updated);
          }),
          tap(() => this.logger.debug(AreaTematicaArbolFragment.name,
            `${this.updateAreas.name}()`, 'end'))
        );
      }));
  }

  private createAreas(nodes: NodeArea[]): Observable<void> {
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.createAreas.name}()`, 'start');
    if (nodes.length === 0) {
      this.logger.debug(AreaTematicaArbolFragment.name, `${this.createAreas.name}()`, 'end');
      return of(void 0);
    }
    return from(nodes).pipe(
      concatMap(node => {
        //Root nodes must match entity parent
        if (!node.parent) {
          node.area.value.padre.id = this.getKey() as number;
        }
        return this.areaTematicaService.create(node.area.value).pipe(
          map(created => {
            node.area = new StatusWrapper<IAreaTematica>(created);
            node.childs.forEach((child) => {
              child.area.value.padre = created;
            });
          }),
          tap(() => this.logger.debug(AreaTematicaArbolFragment.name,
            `${this.createAreas.name}()`, 'end'))
        );
      }));
  }

  private isSaveOrUpdateComplete(nodes: NodeArea[]): boolean {
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'start');
    let pending = this.areasEliminados.length > 0;
    if (pending) {
      return false;
    }
    nodes.forEach((node) => {
      pending = pending || node.area.touched;
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
    this.logger.debug(AreaTematicaArbolFragment.name, `${this.isSaveOrUpdateComplete.name}()`, 'end');
    return true;
  }

}
