import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { FragmentComponent } from '@core/component/fragment.component';
import { AreaTematicaArbolFragment, NodeArea } from './area-tematica-arbol.fragment';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { AreaTematicaActionService } from '../../area-tematica.action.service';

const MSG_DELETE = marker('csp.area.tematica.arbol.listado.borrar');

enum VIEW_MODE {
  NONE = '',
  VIEW = 'view',
  NEW = 'new',
  EDIT = 'edit'
}

@Component({
  selector: 'sgi-area-tematica-arbol',
  templateUrl: './area-tematica-arbol.component.html',
  styleUrls: ['./area-tematica-arbol.component.scss']
})
export class AreaTematicaArbolComponent extends FragmentComponent implements OnInit, OnDestroy {

  private formPart: AreaTematicaArbolFragment;
  private subscriptions = [] as Subscription[];
  @ViewChild(MatTree, { static: true }) private matTree: MatTree<NodeArea>;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  treeControl = new NestedTreeControl<NodeArea>(node => node.childs);
  dataSource = new MatTreeNestedDataSource<NodeArea>();

  viewingNode: NodeArea;
  viewMode = VIEW_MODE.NONE;
  checkedNode: NodeArea;

  formGroup: FormGroup;

  hasChild = (_: number, node: NodeArea) => node.childs.length > 0;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly dialogService: DialogService,
    public actionService: AreaTematicaActionService
  ) {
    super(actionService.FRAGMENT.AREAS_ARBOL, actionService);
    this.logger.debug(AreaTematicaArbolComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.formPart = this.fragment as AreaTematicaArbolFragment;
    this.logger.debug(AreaTematicaArbolComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    super.ngOnInit();
    this.logger.debug(AreaTematicaArbolComponent.name, 'ngOnInit()', 'start');
    this.formPart.areas$.subscribe((programas) => {
      this.dataSource.data = programas;
    });
    this.formGroup = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(5)]),
      descripcion: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    });
    this.switchToNone();
    this.logger.debug(AreaTematicaArbolComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy() {
    this.logger.debug(AreaTematicaArbolComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(AreaTematicaArbolComponent.name, 'ngOnDestroy()', 'end');
  }

  showNodeDetails(node: NodeArea) {
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.showNodeDetails.name}(node: ${node})`, 'start');
    this.viewingNode = node;
    this.switchToView();
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.showNodeDetails.name}(node: ${node})`, 'end');
  }

  hideNodeDetails() {
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.hideNodeDetails.name}()`, 'start');
    this.viewMode = VIEW_MODE.NONE;
    this.viewingNode = undefined;
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.hideNodeDetails.name}()`, 'end');
  }

  onCheckNode(node: NodeArea, $event: MatCheckboxChange) {
    if ($event.checked) {
      this.checkedNode = node;
    }
    else {
      this.checkedNode = undefined;
    }
  }

  switchToNew() {
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.switchToNew.name}()`, 'start');
    const newNode = new NodeArea(new StatusWrapper<IAreaTematica>({
      padre: {} as IAreaTematica
    } as IAreaTematica));
    this.viewMode = VIEW_MODE.NEW;
    this.viewingNode = newNode;
    this.loadDetails(this.viewingNode);
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.switchToNew.name}()`, 'end');
  }

  switchToEdit() {
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.switchToEdit.name}()`, 'start');
    this.viewMode = VIEW_MODE.EDIT;
    this.loadDetails(this.viewingNode);
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.switchToEdit.name}()`, 'end');
  }

  switchToView() {
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.switchToView.name}()`, 'start');
    this.viewMode = VIEW_MODE.VIEW;
    this.loadDetails(this.viewingNode);
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.switchToView.name}()`, 'end');
  }

  private switchToNone() {
    this.viewMode = VIEW_MODE.NONE;
    this.viewingNode = undefined;
    this.loadDetails(undefined);
    this.checkedNode = undefined;
  }

  private loadDetails(node: NodeArea) {
    this.logger.debug(AreaTematicaArbolComponent.name,
      `${this.loadDetails.name}()`, 'start');
    if (this.viewMode === VIEW_MODE.NEW || this.viewMode === VIEW_MODE.EDIT) {
      this.formGroup.get('nombre').enable();
      this.formGroup.get('descripcion').enable();
    }
    else {
      this.formGroup.get('nombre').disable();
      this.formGroup.get('descripcion').disable();
    }
    this.formGroup.reset();
    this.formGroup.get('nombre').patchValue(node?.area?.value?.nombre);
    this.formGroup.get('descripcion').patchValue(node?.area?.value?.descripcion);

    this.logger.debug(AreaTematicaArbolComponent.name,
      `${this.loadDetails.name}()`, 'start');
  }

  cancelDetail() {
    if (this.viewMode === VIEW_MODE.EDIT) {
      this.switchToView();
    }
    else {
      this.switchToNone();
    }
  }

  private refreshTree(nodes: NodeArea[]) {
    // There is no way to update the tree without recreating it,
    // because CDK Tree detect changes only when a root nodes changes
    // See: https://github.com/angular/components/issues/11381
    this.matTree.renderNodeChanges([]);
    this.matTree.renderNodeChanges(nodes);
  }

  acceptDetail() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      if (this.viewMode === VIEW_MODE.NEW) {
        this.addNode(this.getDetailNode());
      }
      else if (this.viewMode === VIEW_MODE.EDIT) {
        this.updateNode(this.getDetailNode());
      }
    }
  }

  private getDetailNode(): NodeArea {
    const detail = this.viewingNode;
    detail.area.value.nombre = this.formGroup.get('nombre').value;
    detail.area.value.descripcion = this.formGroup.get('descripcion').value;
    return detail;
  }

  private addNode(node: NodeArea) {
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.addNode.name}()`, 'start');

    node.area.setCreated();
    if (this.checkedNode) {
      this.checkedNode.addChild(node);
      this.refreshTree(this.formPart.areas$.value);
    }
    else {
      const current = this.formPart.areas$.value;
      current.push(node);
      this.formPart.publishNodes(current);
    }
    this.formPart.setChanges(true);
    this.switchToNone();

    this.logger.debug(AreaTematicaArbolComponent.name, `${this.addNode.name}()`, 'end');
  }

  private updateNode(node: NodeArea) {
    this.logger.debug(AreaTematicaArbolComponent.name, `${this.updateNode.name}()`, 'start');
    if (!node.area.created) {
      node.area.setEdited();
    }
    if (node.parent) {
      node.parent.sortChildsByName();
    }
    else {
      this.formPart.publishNodes();
    }
    this.refreshTree(this.formPart.areas$.value);
    this.formPart.setChanges(true);
    this.switchToView();

    this.logger.debug(AreaTematicaArbolComponent.name, `${this.updateNode.name}()`, 'end');
  }

  deleteDetail() {
    this.logger.debug(AreaTematicaArbolComponent.name,
      `${this.deleteDetail.name}()`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            if (this.viewingNode.parent) {
              this.viewingNode.parent.removeChild(this.viewingNode);
              this.refreshTree(this.formPart.areas$.value);
            }
            else {
              const updated = this.formPart.areas$.value.filter((programa) => programa !== this.viewingNode);
              this.formPart.publishNodes(updated);
            }
            this.formPart.addToDelete(this.viewingNode);
            this.formPart.setChanges(true);
            this.switchToNone();
          }
        }
      )
    );
    this.logger.debug(AreaTematicaArbolComponent.name,
      `${this.deleteDetail.name}()`, 'end');
  }
}
