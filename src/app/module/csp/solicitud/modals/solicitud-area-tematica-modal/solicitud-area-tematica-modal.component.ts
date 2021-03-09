import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, takeLast } from 'rxjs/operators';
import { AreaTematicaSolicitudData } from '../../solicitud-formulario/solicitud-proyecto-ficha-general/solicitud-proyecto-ficha-general.fragment';

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

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

@Component({
  templateUrl: './solicitud-area-tematica-modal.component.html',
  styleUrls: ['./solicitud-area-tematica-modal.component.scss']
})
export class SolicitudAreaTematicaModalComponent extends
  BaseModalComponent<AreaTematicaSolicitudData, SolicitudAreaTematicaModalComponent> implements OnInit {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  areaTematicaTree$ = new BehaviorSubject<NodeAreaTematica[]>([]);
  treeControl = new NestedTreeControl<NodeAreaTematica>(node => node.childs);
  dataSource = new MatTreeNestedDataSource<NodeAreaTematica>();
  private nodeMap = new Map<number, NodeAreaTematica>();

  checkedNode: NodeAreaTematica;
  textSaveOrUpdate: string;
  hasChild = (_: number, node: NodeAreaTematica) => node.childs.length > 0;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<SolicitudAreaTematicaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AreaTematicaSolicitudData,
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
    this.textSaveOrUpdate = this.data.areaTematicaSolicitud ? MSG_ACEPTAR : MSG_ANADIR;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadAreasTematicas(this.data.areaTematicaConvocatoria.id);
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      padre: new FormControl({
        value: this.data.areaTematicaConvocatoria.nombre,
        disabled: true
      }),
    });

    if (this.data.readonly) {
      formGroup.disable();
    }

    return formGroup;
  }

  protected getDatosForm(): AreaTematicaSolicitudData {
    this.data.areaTematicaSolicitud = this.checkedNode?.areaTematica?.value;
    return this.data;
  }

  private loadAreasTematicas(id: number): void {
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
        this.checkedNode = this.nodeMap.get(this.data.areaTematicaSolicitud?.id);
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

  getNombreAreaTematica(areaTematica: IAreaTematica) {
    return areaTematica?.nombre;
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
