import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';

import { ProgramaService } from '@core/services/csp/programa.service';
import { BaseModalComponent } from '@core/component/base-modal.component';
import {
  BuscarEmpresaEconomicaDialogoComponent, EmpresaEconomicaModalData
} from '@shared/buscar-empresa-economica/dialogo/buscar-empresa-economica-dialogo.component';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { IPrograma } from '@core/models/csp/programa';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, mergeMap, startWith, switchMap, takeLast, tap } from 'rxjs/operators';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogService } from '@core/services/dialog.service';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { ConvocatoriaEntidadConvocanteData } from '../../convocatoria-formulario/convocatoria-entidades-convocantes/convocatoria-entidades-convocantes.fragment';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_FORM_GROUP_WITHOUT_PLAN = marker('csp.convocatoria.entidades.convocantes.modal.sin.plan');
const MSG_FORM_GROUP_WITHOUT_PROGRAMA = marker('csp.convocatoria.entidades.convocantes.modal.sin.programa');

export interface ConvocatoriaEntidadConvocanteModalData {
  entidadConvocanteData: ConvocatoriaEntidadConvocanteData;
  selectedEmpresas: IEmpresaEconomica[];
}

class NodePrograma {
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

@Component({
  templateUrl: './convocatoria-entidad-convocante-modal.component.html',
  styleUrls: ['./convocatoria-entidad-convocante-modal.component.scss']
})
export class ConvocatoriaEntidadConvocanteModalComponent extends
  BaseModalComponent<ConvocatoriaEntidadConvocanteModalData, ConvocatoriaEntidadConvocanteModalComponent> implements OnInit {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  private empresa: IEmpresaEconomica;
  planes$: Observable<IPrograma[]>;
  private programaFiltered = [] as IPrograma[];

  programaTree$ = new BehaviorSubject<NodePrograma[]>([]);
  treeControl = new NestedTreeControl<NodePrograma>(node => node.childs);
  dataSource = new MatTreeNestedDataSource<NodePrograma>();
  private nodeMap = new Map<number, NodePrograma>();

  checkedNode: NodePrograma;
  hasChild = (_: number, node: NodePrograma) => node.childs.length > 0;

  constructor(
    protected logger: NGXLogger,
    public matDialogRef: MatDialogRef<ConvocatoriaEntidadConvocanteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConvocatoriaEntidadConvocanteModalData,
    protected snackBarService: SnackBarService,
    private programaService: ProgramaService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(logger, snackBarService, matDialogRef, data);
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, 'constructor()', 'start');

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.xs = 'row';

    if (!data.entidadConvocanteData) {
      data.entidadConvocanteData = {
        entidadConvocante: new StatusWrapper<IConvocatoriaEntidadConvocante>({} as IConvocatoriaEntidadConvocante),
        empresaEconomica: {} as IEmpresaEconomica,
        modalidad: undefined,
        plan: undefined,
        programa: undefined,
      };
    }

    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.empresa = this.data.entidadConvocanteData.empresaEconomica;
    this.subscriptions.push(this.programaTree$.subscribe(
      (programas) => {
        this.dataSource.data = programas;
      }
    ));
    this.subscriptions.push(this.programaService.findAllPlan().subscribe(
      list => {
        this.programaFiltered = list.items;
        this.planes$ = this.formGroup.get('plan').valueChanges.pipe(
          startWith(''),
          map(value => this.filterPrograma(value)),
          tap(() => {
            // Reset selected node on first user change
            if (this.formGroup.get('plan').value?.id !== this.data.entidadConvocanteData.plan?.id) {
              this.formGroup.get('programa').setValue(undefined);
              this.checkedNode = undefined;
            }
            this.loadTreePrograma();
          })
        );
      }
    ));
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, 'ngOnInit()', 'end');
  }

  private filterPrograma(value: string): IPrograma[] {
    const filterValue = value.toString().toLowerCase();
    return this.programaFiltered.filter(programa =>
      programa.nombre.toLowerCase().includes(filterValue));
  }

  getNombrePlan(plan: IPrograma): string {
    return plan?.nombre;
  }

  private loadTreePrograma() {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `loadTreePrograma()`, 'start');
    const id = this.formGroup.get('plan').value?.id;
    if (id && !isNaN(id)) {
      this.checkedNode = undefined;
      const subscription = this.programaService.findAllHijosPrograma(id).pipe(
        switchMap(response => {
          return from(response.items).pipe(
            mergeMap((programa) => {
              const node = new NodePrograma(new StatusWrapper<IPrograma>(programa));
              this.nodeMap.set(node.programa.value.id, node);
              return this.getChilds(node).pipe(map(() => node));
            })
          );
        })
      ).subscribe(
        (programa) => {
          const current = this.programaTree$.value;
          current.push(programa);
          this.publishNodes(current);
          this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
            `loadTreePrograma()`, 'end');
        },
        (error) => {
          this.logger.error(ConvocatoriaEntidadConvocanteModalComponent.name,
            `loadTreePrograma()`, error);
        },
        () => {
          this.checkedNode = this.nodeMap.get(this.formGroup.get('programa').value);
          if (this.checkedNode) {
            this.expandNodes(this.checkedNode);
          }
        }
      );
      this.subscriptions.push(subscription);
    }
    else {
      this.programaTree$.next([]);
      this.nodeMap.clear();
    }
  }

  private getChilds(parent: NodePrograma): Observable<NodePrograma[]> {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `getChilds(parent: ${parent})`, 'start');
    return this.programaService.findAllHijosPrograma(parent.programa.value.id).pipe(
      map((result) => {
        const childs: NodePrograma[] = result.items.map(
          (programa) => {
            const child = new NodePrograma(new StatusWrapper<IPrograma>(programa));
            child.parent = parent;
            this.nodeMap.set(child.programa.value.id, child);
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
        return of([]);
      }),
      takeLast(1),
      tap(() => this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
        `getChilds(parent: ${parent})`, 'end'))
    );
  }

  private expandNodes(node: NodePrograma) {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `expandNodes(node: ${node})`, 'start');
    if (node && node.parent) {
      this.treeControl.expand(node.parent);
      this.expandNodes(node.parent);
    }
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `expandNodes(node: ${node})`, 'start');
  }

  private publishNodes(rootNodes?: NodePrograma[]) {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, `publishNodes()`, 'start');
    let nodes = rootNodes ? rootNodes : this.programaTree$.value;
    nodes = sortByName(nodes);
    this.programaTree$.next(nodes);
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, `publishNodes()`, 'end');
  }

  protected getFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, `getFormGroup()`, 'start');
    const formGroup = new FormGroup({
      nombreEmpresa: new FormControl(this.data.entidadConvocanteData.empresaEconomica.razonSocial, Validators.required),
      plan: new FormControl(this.data.entidadConvocanteData.plan, IsEntityValidator.isValid()),
      programa: new FormControl(this.data.entidadConvocanteData.entidadConvocante.value.programa?.id)
    });
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, `getFormGroup()`, 'end');
    return formGroup;
  }

  protected getDatosForm(): ConvocatoriaEntidadConvocanteModalData {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `getDatosForm()`, 'start');
    const entidadConvocante = this.data.entidadConvocanteData.entidadConvocante;
    entidadConvocante.value.entidadRef = this.empresa.personaRef;
    const plan = this.formGroup.get('plan').value;
    const programa = this.checkedNode?.programa?.value;
    entidadConvocante.value.programa = programa ? programa : plan;
    if (plan === '' && !programa) {
      entidadConvocante.value.programa = undefined;
    }
    this.data.entidadConvocanteData.empresaEconomica = this.empresa;
    this.data.entidadConvocanteData.modalidad = entidadConvocante.value.programa;
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `getDatosForm()`, 'start');
    return this.data;
  }

  selectEmpresaEconomica(): void {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, `selectEmpresaEconomica()`, 'start');
    const data: EmpresaEconomicaModalData = {
      empresaEconomica: this.empresa ? this.empresa : {} as IEmpresaEconomica,
      selectedEmpresa: this.data.selectedEmpresas
    };
    const dialogRef = this.dialog.open(BuscarEmpresaEconomicaDialogoComponent, {
      width: '1000px',
      data
    });
    dialogRef.afterClosed().subscribe(empresaEconomica => {
      if (empresaEconomica) {
        this.empresa = empresaEconomica;
        this.formGroup.get('nombreEmpresa').setValue(empresaEconomica.razonSocial);
      }
    });
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name, `selectEmpresaEconomica()`, 'end');
  }

  onCheckNode(node: NodePrograma, $event: MatCheckboxChange): void {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `onCheckNode(node: ${node}, $event: ${$event})`, 'start');
    this.checkedNode = $event.checked ? node : undefined;
    this.formGroup.get('programa').setValue(this.checkedNode?.programa?.value?.id);
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `onCheckNode(node: ${node}, $event: ${$event})`, 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(BaseModalComponent.name, `saveOrUpdate()`, 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      const plan = this.formGroup.get('plan').value;
      const programa = this.checkedNode;
      if (!plan && !programa) {
        this.saveIncompleteFormGroup(MSG_FORM_GROUP_WITHOUT_PLAN);
      } else if (!programa) {
        this.saveIncompleteFormGroup(MSG_FORM_GROUP_WITHOUT_PROGRAMA);
      } else {
        this.closeModal(this.getDatosForm());
      }
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(BaseModalComponent.name, `saveOrUpdate()`, 'end');
  }

  private saveIncompleteFormGroup(message: string): void {
    this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
      `saveIncompleteFormGroup()`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(message).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.closeModal(this.getDatosForm());
          }
          this.logger.debug(ConvocatoriaEntidadConvocanteModalComponent.name,
            `saveIncompleteFormGroup()`, 'end');
        }
      )
    );
  }
}
