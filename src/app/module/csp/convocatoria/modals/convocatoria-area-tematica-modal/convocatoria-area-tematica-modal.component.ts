import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';
import { AreaTematicaData } from '../../convocatoria-formulario/convocatoria-datos-generales/convocatoria-datos-generales.fragment';

const MSG_ERROR_AREA_TEMATICA = marker('csp.convocatoria.area.tematica.modal.error.areas');
const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
class NodeAreaTematica {
  parent: NodeAreaTematica;
  areaTematica: StatusWrapper<IAreaTematica>;
  // tslint:disable-next-line: variable-name
  _childs: NodeAreaTematica[];
  get childs(): NodeAreaTematica[] {
    return this._childs;
  }

  constructor(areaTematica: StatusWrapper<IAreaTematica>) {
    this.areaTematica = areaTematica;
    this._childs = [];
  }

  addChild(child: NodeAreaTematica) {
    child.parent = this;
    child.areaTematica.value.padre = this.areaTematica.value;
    this._childs.push(child);
    this.sortChildsByName();
  }

  removeChild(child: NodeAreaTematica) {
    this._childs = this._childs.filter((areaTematica) => areaTematica !== child);
  }

  sortChildsByName(): void {
    this._childs = sortByName(this._childs);
  }
}

function sortByName(nodes: NodeAreaTematica[]): NodeAreaTematica[] {
  return nodes.sort((a, b) => {
    if (a.areaTematica.value.nombre < b.areaTematica.value.nombre) {
      return -1;
    }
    if (a.areaTematica.value.nombre > b.areaTematica.value.nombre) {
      return 1;
    }
    return 0;
  });
}

@Component({
  templateUrl: './convocatoria-area-tematica-modal.component.html',
  styleUrls: ['./convocatoria-area-tematica-modal.component.scss']
})
export class ConvocatoriaAreaTematicaModalComponent extends
  BaseModalComponent<AreaTematicaData, ConvocatoriaAreaTematicaModalComponent> implements OnInit {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  areasTematicas$: Observable<IAreaTematica[]>;
  areaTematicaTree$ = new BehaviorSubject<NodeAreaTematica[]>([]);
  treeControl = new NestedTreeControl<NodeAreaTematica>(node => node.childs);
  dataSource = new MatTreeNestedDataSource<NodeAreaTematica>();
  private nodeMap = new Map<number, NodeAreaTematica>();

  textSaveOrUpdate: string;

  checkedNode: NodeAreaTematica;
  hasChild = (_: number, node: NodeAreaTematica) => node.childs.length > 0;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ConvocatoriaAreaTematicaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AreaTematicaData,
    private areaTematicaService: AreaTematicaService
  ) {
    super(snackBarService, matDialogRef, data);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.xs = 'row';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadAreasTematicas();
    this.loadTreeAreaTematica();
    const subscription = this.formGroup.get('padre').valueChanges.pipe(
      tap(() => this.loadTreeAreaTematica())
    ).subscribe();
    this.textSaveOrUpdate = this.data.convocatoriaAreaTematica.value.areaTematica?.padre ? MSG_ACEPTAR : MSG_ANADIR;
    this.subscriptions.push(subscription);
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      padre: new FormControl(this.data.padre, [Validators.required, IsEntityValidator.isValid()]),
      observaciones: new FormControl(this.data.observaciones, Validators.maxLength(2000))
    });
    return formGroup;
  }

  protected getDatosForm(): AreaTematicaData {
    const data = this.data.convocatoriaAreaTematica.value;
    const padre = this.formGroup.get('padre').value;
    const areaTematica = this.checkedNode?.areaTematica?.value;
    data.areaTematica = areaTematica ? areaTematica : padre;
    data.observaciones = this.formGroup.get('observaciones').value;
    return this.data;
  }

  private loadAreasTematicas(): void {
    this.areasTematicas$ = this.areaTematicaService.findAllGrupo().pipe(
      map(res => res.items),
      catchError(error => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_AREA_TEMATICA);
        return of([]);
      })
    );
  }

  getNombreAreaTematica(areaTematica: IAreaTematica) {
    return areaTematica?.nombre;
  }

  private loadTreeAreaTematica() {
    this.areaTematicaTree$.next([]);
    this.nodeMap.clear();
    const padre = this.formGroup.get('padre').value;
    if (padre) {
      const id = padre.id;
      if (id && !isNaN(id)) {
        const susbcription = this.areaTematicaService.findAllHijosArea(id).pipe(
          switchMap(response => {
            return from(response.items).pipe(
              mergeMap((areaTematica) => {
                const node = new NodeAreaTematica(new StatusWrapper<IAreaTematica>(areaTematica));
                this.nodeMap.set(node.areaTematica.value.id, node);
                return this.getChilds(node).pipe(map(() => node));
              })
            );
          })
        ).subscribe(
          (result) => {
            const current = this.areaTematicaTree$.value;
            current.push(result);
            this.publishNodes(current);
            this.checkedNode = this.nodeMap.get(this.data.convocatoriaAreaTematica?.value?.areaTematica?.id);
            if (this.checkedNode) {
              this.expandNodes(this.checkedNode);
            }
          },
          (error) => {
            this.logger.error(error);
          }
        );
        this.subscriptions.push(susbcription);
      }
    }
  }

  private expandNodes(node: NodeAreaTematica) {
    if (node && node.parent) {
      this.treeControl.expand(node.parent);
      this.expandNodes(node.parent);
    }
  }

  private getChilds(parent: NodeAreaTematica): Observable<NodeAreaTematica[]> {
    return this.areaTematicaService.findAllHijosArea(parent.areaTematica.value.id).pipe(
      map((result) => {
        const childs: NodeAreaTematica[] = result.items.map(
          (areaTematica) => {
            const child = new NodeAreaTematica(new StatusWrapper<IAreaTematica>(areaTematica));
            child.parent = parent;
            this.nodeMap.set(child.areaTematica.value.id, child);
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

  private publishNodes(rootNodes?: NodeAreaTematica[]) {
    let nodes = rootNodes ? rootNodes : this.areaTematicaTree$.value;
    nodes = sortByName(nodes);
    this.areaTematicaTree$.next(nodes);
    this.areaTematicaTree$.subscribe(
      (areaTematicas) => {
        this.dataSource.data = areaTematicas;
      }
    );
  }

  onCheckNode(node: NodeAreaTematica, $event: MatCheckboxChange): void {
    this.checkedNode = $event.checked ? node : undefined;
  }
}
