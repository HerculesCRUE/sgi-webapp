import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IPrograma } from '@core/models/csp/programa';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { PlanInvestigacionActionService } from '../../plan-investigacion.action.service';
import { NodePrograma, PlanInvestigacionProgramaFragment } from './plan-investigacion-programas.fragment';

const MSG_DELETE = marker('csp.plan.investigacion.programa.listado.borrar');

enum VIEW_MODE {
  NONE = '',
  VIEW = 'view',
  NEW = 'new',
  EDIT = 'edit'
}

@Component({
  selector: 'sgi-plan-investigacion-programas',
  templateUrl: './plan-investigacion-programas.component.html',
  styleUrls: ['./plan-investigacion-programas.component.scss']
})
export class PlanInvestigacionProgramasComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: PlanInvestigacionProgramaFragment;
  private subscriptions = [] as Subscription[];
  @ViewChild(MatTree, { static: true }) private matTree: MatTree<NodePrograma>;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  treeControl = new NestedTreeControl<NodePrograma>(node => node.childs);
  dataSource = new MatTreeNestedDataSource<NodePrograma>();

  viewingNode: NodePrograma;
  viewMode = VIEW_MODE.NONE;
  checkedNode: NodePrograma;

  formGroup: FormGroup;

  hasChild = (_: number, node: NodePrograma) => node.childs.length > 0;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly dialogService: DialogService,
    public actionService: PlanInvestigacionActionService
  ) {
    super(actionService.FRAGMENT.PROGRAMAS, actionService);
    this.logger.debug(PlanInvestigacionProgramasComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.formPart = this.fragment as PlanInvestigacionProgramaFragment;
    this.logger.debug(PlanInvestigacionProgramasComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    super.ngOnInit();
    this.logger.debug(PlanInvestigacionProgramasComponent.name, 'ngOnInit()', 'start');
    this.formPart.programas$.subscribe((programas) => {
      this.dataSource.data = programas;
    });
    this.formGroup = new FormGroup({
      nombre: new FormControl('', Validators.required),
      descripcion: new FormControl('')
    });
    this.switchToNone();
    this.logger.debug(PlanInvestigacionProgramasComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy() {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(PlanInvestigacionProgramasComponent.name, 'ngOnDestroy()', 'end');
  }

  showNodeDetails(node: NodePrograma) {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.showNodeDetails.name}(node: ${node})`, 'start');
    this.viewingNode = node;
    this.switchToView();
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.showNodeDetails.name}(node: ${node})`, 'end');
  }

  hideNodeDetails() {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.hideNodeDetails.name}()`, 'start');
    this.viewMode = VIEW_MODE.NONE;
    this.viewingNode = undefined;
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.hideNodeDetails.name}()`, 'end');
  }

  onCheckNode(node: NodePrograma, $event: MatCheckboxChange) {
    if ($event.checked) {
      this.checkedNode = node;
    }
    else {
      this.checkedNode = undefined;
    }
  }

  switchToNew() {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.switchToNew.name}()`, 'start');
    const newNode = new NodePrograma(new StatusWrapper<IPrograma>({
      padre: {} as IPrograma
    } as IPrograma));
    this.viewMode = VIEW_MODE.NEW;
    this.viewingNode = newNode;
    this.loadDetails(this.viewingNode);
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.switchToNew.name}()`, 'end');
  }

  switchToEdit() {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.switchToEdit.name}()`, 'start');
    this.viewMode = VIEW_MODE.EDIT;
    this.loadDetails(this.viewingNode);
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.switchToEdit.name}()`, 'end');
  }

  switchToView() {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.switchToView.name}()`, 'start');
    this.viewMode = VIEW_MODE.VIEW;
    this.loadDetails(this.viewingNode);
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.switchToView.name}()`, 'end');
  }

  private switchToNone() {
    this.viewMode = VIEW_MODE.NONE;
    this.viewingNode = undefined;
    this.loadDetails(undefined);
    this.checkedNode = undefined;
  }

  private loadDetails(node: NodePrograma) {
    this.logger.debug(PlanInvestigacionProgramasComponent.name,
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
    this.formGroup.get('nombre').patchValue(node?.programa?.value?.nombre);
    this.formGroup.get('descripcion').patchValue(node?.programa?.value?.descripcion);

    this.logger.debug(PlanInvestigacionProgramasComponent.name,
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

  private refreshTree(nodes: NodePrograma[]) {
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

  private getDetailNode(): NodePrograma {
    const detail = this.viewingNode;
    detail.programa.value.nombre = this.formGroup.get('nombre').value;
    detail.programa.value.descripcion = this.formGroup.get('descripcion').value;
    return detail;
  }

  private addNode(node: NodePrograma) {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.addNode.name}()`, 'start');

    node.programa.setCreated();
    if (this.checkedNode) {
      this.checkedNode.addChild(node);
      this.refreshTree(this.formPart.programas$.value);
    }
    else {
      const current = this.formPart.programas$.value;
      current.push(node);
      this.formPart.publishNodes(current);
    }
    this.formPart.setChanges(true);
    this.switchToNone();

    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.addNode.name}()`, 'end');
  }

  private updateNode(node: NodePrograma) {
    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.updateNode.name}()`, 'start');
    if (!node.programa.created) {
      node.programa.setEdited();
    }
    if (node.parent) {
      node.parent.sortChildsByName();
    }
    else {
      this.formPart.publishNodes();
    }
    this.refreshTree(this.formPart.programas$.value);
    this.formPart.setChanges(true);
    this.switchToView();

    this.logger.debug(PlanInvestigacionProgramasComponent.name, `${this.updateNode.name}()`, 'end');
  }

  deleteDetail() {
    this.logger.debug(PlanInvestigacionProgramasComponent.name,
      `${this.deleteDetail.name}()`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            if (this.viewingNode.parent) {
              this.viewingNode.parent.removeChild(this.viewingNode);
              this.refreshTree(this.formPart.programas$.value);
            }
            else {
              const updated = this.formPart.programas$.value.filter((programa) => programa !== this.viewingNode);
              this.formPart.publishNodes(updated);
            }
            this.formPart.addToDelete(this.viewingNode);
            this.formPart.setChanges(true);
            this.switchToNone();
          }
        }
      )
    );
    this.logger.debug(PlanInvestigacionProgramasComponent.name,
      `${this.deleteDetail.name}()`, 'end');
  }
}
