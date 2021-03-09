import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IApartado } from '@core/models/eti/apartado';
import { IBloque } from '@core/models/eti/bloque';
import { IComentario } from '@core/models/eti/comentario';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { resolveFormularioByTipoEvaluacionAndComite } from '@core/models/eti/formulario';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ActionService } from '@core/services/action-service';
import { ApartadoService } from '@core/services/eti/apartado.service';
import { BloqueService } from '@core/services/eti/bloque.service';
import { FormularioService } from '@core/services/eti/formulario.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, Observable, of, Subscription } from 'rxjs';
import { EvaluacionFormularioActionService } from '../../evaluacion-formulario/evaluacion-formulario.action.service';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { catchError, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';

const MSG_ERROR_BLOQUE = marker('eti.comentario.bloque.error.cargar');
const MSG_ERROR_APARTADO = marker('eti.comentario.apartado.error.cargar');
const MSG_ERROR_FORM_GROUP = marker('form-group.error');

export interface ComentarioModalData {
  evaluacion: IEvaluacion;
  comentario: IComentario;
}

class NodeApartado {
  parent: NodeApartado;
  apartado: StatusWrapper<IApartado>;
  // tslint:disable-next-line: variable-name
  _childs: NodeApartado[];
  get childs(): NodeApartado[] {
    return this._childs;
  }

  constructor(apartado: StatusWrapper<IApartado>) {
    this.apartado = apartado;
    this._childs = [];
  }

  addChild(child: NodeApartado) {
    child.parent = this;
    child.apartado.value.padre = this.apartado.value;
    this._childs.push(child);
    this.sortChildsByName();
  }

  removeChild(child: NodeApartado) {
    this._childs = this._childs.filter((apartado) => apartado !== child);
  }

  sortChildsByName(): void {
    this._childs = sortByName(this._childs);
  }
}

function sortByName(nodes: NodeApartado[]): NodeApartado[] {
  return nodes.sort((a, b) => {
    if (a.apartado.value.nombre < b.apartado.value.nombre) {
      return -1;
    }
    if (a.apartado.value.nombre > b.apartado.value.nombre) {
      return 1;
    }
    return 0;
  });
}

@Component({
  templateUrl: './comentario-modal.component.html',
  styleUrls: ['./comentario-modal.component.scss'],
  providers: [
    {
      provide: ActionService,
      useExisting: EvaluacionFormularioActionService
    }
  ]
})
export class ComentarioModalComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;

  private suscripciones: Subscription[];

  apartado$: Observable<IBloque[]>;
  treeControl = new NestedTreeControl<NodeApartado>(node => node.childs);
  dataSource = new MatTreeNestedDataSource<NodeApartado>();
  private nodeMap = new Map<number, NodeApartado>();

  mostrarError: boolean;

  checkedNode: NodeApartado;
  hasChild = (_: number, node: NodeApartado) => node.childs.length > 0;

  constructor(
    private readonly logger: NGXLogger,
    private readonly formularioService: FormularioService,
    private readonly bloqueService: BloqueService,
    private readonly apartadoService: ApartadoService,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ComentarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComentarioModalData,
  ) {
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
    this.fxLayoutProperties.layoutAlign = 'space-around start';
    this.suscripciones = [];
  }

  ngOnInit(): void {
    this.suscripciones = [];
    this.formGroup = new FormGroup({
      bloque: new FormControl(this.data?.comentario?.apartado?.bloque, [Validators.required, IsEntityValidator.isValid()]),
      comentario: new FormControl(this.data?.comentario?.texto, [
        Validators.required, Validators.maxLength(2000)])
    });
    this.loadBloques();
    if (this.data?.comentario?.apartado?.bloque) {
      this.loadTreeApartados(this.data?.comentario?.apartado?.bloque.id);
    }
    const subscription = this.formGroup.get('bloque').valueChanges.subscribe((value) => this.loadTreeApartados(value.id));
    this.suscripciones.push(subscription);
  }

  /**
   * Carga todos los bloques de la aplicación
   */
  private loadBloques(): void {
    this.apartado$ = this.formularioService.getBloques(resolveFormularioByTipoEvaluacionAndComite
      (this.data?.evaluacion?.tipoEvaluacion, this.data?.evaluacion?.memoria?.comite)).pipe(
        map(res => res.items),
        catchError(error => {
          this.closeModalError(MSG_ERROR_BLOQUE);
          this.snackBarService.showError(MSG_ERROR_APARTADO);
          this.logger.error(ComentarioModalComponent.name,
            `loadBloques()`, error);
          return of([]);
        })
      );
  }

  /**
   * Carga todos los apartados del bloque seleccionado
   */
  private loadTreeApartados(id?: number) {
    this.nodeMap.clear();
    this.dataSource.data = [];
    if (id) {
      const susbcription = this.bloqueService.getApartados(id).pipe(
        switchMap(response => {
          return from(response.items).pipe(
            mergeMap((apartado) => {
              const node = new NodeApartado(new StatusWrapper<IApartado>(apartado));
              this.nodeMap.set(node.apartado.value.id, node);
              return this.getChilds(node).pipe(map(() => node));
            })
          );
        })
      ).subscribe(
        (result) => {
          const current = this.dataSource.data ? this.dataSource.data : [];
          current.push(result);
          this.publishNodes(current);
          this.checkedNode = this.nodeMap.get(this.data.evaluacion.tipoEvaluacion.id);
          if (this.checkedNode) {
            this.expandNodes(this.checkedNode);
          }
        },
        (error) => {
          this.logger.error(ComentarioModalComponent.name,
            `loadTreeApartados()`, error);
        }
      );
      this.suscripciones.push(susbcription);
    }
  }

  /**
   * Carga todos los subapartados del apartado seleccionado en el formulario
   */
  private getChilds(parent: NodeApartado): Observable<NodeApartado[]> {
    return this.apartadoService.getHijos(parent.apartado.value.id).pipe(
      map((result) => {
        const childs: NodeApartado[] = result.items.map(
          (apartado) => {
            const child = new NodeApartado(new StatusWrapper<IApartado>(apartado));
            child.parent = parent;
            this.nodeMap.set(child.apartado.value.id, child);
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

  private expandNodes(node: NodeApartado) {
    if (node && node.parent) {
      this.treeControl.expand(node.parent);
      this.expandNodes(node.parent);
    }
  }

  private publishNodes(rootNodes?: NodeApartado[]) {
    let nodes = rootNodes ? rootNodes : this.dataSource.data;
    nodes = sortByName(nodes);
    this.dataSource.data = nodes;
  }

  onCheckNode(node: NodeApartado, $event: MatCheckboxChange): void {
    this.mostrarError = false;
    this.checkedNode = $event.checked ? node : undefined;
  }

  ngOnDestroy(): void {
    this.suscripciones?.forEach(suscription => suscription.unsubscribe());
  }

  /**
   * Muestra un mensaje de error y cierra la ventana modal
   *
   * @param texto Texto de error a mostrar
   */
  private closeModalError(texto: string): void {
    this.snackBarService.showError(texto);
    this.closeModal();
  }

  /**
   * Cierra la ventana modal y devuelve el comentario si se ha creado
   *
   * @param comentario Comentario creado
   */
  closeModal(comentario?: IComentario): void {
    this.matDialogRef.close(comentario);
  }

  getNombreBloque(bloque: IBloque): string {
    return bloque?.nombre;
  }

  /**
   * Comprueba el formulario y envia el comentario resultante
   */
  saveComentario() {
    if (this.formGroup.valid) {
      if (this.checkedNode?.apartado?.value) {
        this.closeModal(this.getDatosForm());
      } else {
        this.mostrarError = true;
        this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
      }
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
  }

  /**
   * Método para actualizar la entidad con los datos del formgroup + tree
   */
  private getDatosForm(): IComentario {
    const comentario = {} as IComentario;
    const subapartado: IApartado = this.checkedNode?.apartado?.value;
    if (subapartado) {
      comentario.apartado = subapartado;
    }
    comentario.texto = FormGroupUtil.getValue(this.formGroup, 'comentario');
    comentario.memoria = this.data.evaluacion.memoria;
    return comentario;
  }
}
