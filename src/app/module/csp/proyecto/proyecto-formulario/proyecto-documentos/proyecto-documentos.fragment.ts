
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoDocumento } from '@core/models/csp/proyecto-documento';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { IProyectoPeriodoSeguimientoDocumento } from '@core/models/csp/proyecto-periodo-seguimiento-documento';
import { IProyectoProrroga } from '@core/models/csp/proyecto-prorroga';
import { IProyectoProrrogaDocumento } from '@core/models/csp/proyecto-prorroga-documento';
import { IProyectoSocioPeriodoJustificacion } from '@core/models/csp/proyecto-socio-periodo-justificacion';
import { ISocioPeriodoJustificacionDocumento } from '@core/models/csp/socio-periodo-justificacion-documento';
import { ITipoDocumento, ITipoFase } from '@core/models/csp/tipos-configuracion';
import { IDocumento } from '@core/models/sgdoc/documento';
import { Fragment } from '@core/services/action-service';
import { ProyectoDocumentoService } from '@core/services/csp/proyecto-documento.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { map, mergeMap, takeLast, tap } from 'rxjs/operators';

const SIN_TIPO_FASE = marker('csp.proyecto.documentos.sinTipoFase.title');
const SIN_TIPO_DOCUMENTO = marker('csp.proyecto.documentos.sinTipoDocumento.title');

const PERIODO_JUSTIFICACION_PERIODO_TITLE = marker('csp.proyecto.documentos.periodoJustificacion.periodo.title');
const PRORROGA_PERIODO_TITLE = marker('csp.proyecto.documentos.prorroga.periodo.title');
const SEGUIMIENTO_PERIODO_TITLE = marker('csp.proyecto.documentos.seguimiento.periodo.title');

const PERIODO_JUSTIFICACION_TITLE = marker('csp.proyecto.documentos.periodoJustificacion.title');
const PRORROGA_TITLE = marker('csp.proyecto.documentos.prorroga.title');
const SEGUIMIENTO_TITLE = marker('csp.proyecto.documentos.seguimiento.title');

enum TIPO_DOCUMENTO {
  PROYECTO = '0',
  SEGUIMIENTO = '1',
  PRORROGA = '3',
  PERIODO_JUSTIFICACION = '2'
}

interface IDocumentoData {
  id: number;
  nombre: string;
  documentoRef: string;
  tipoFase: ITipoFase;
  tipoDocumento: ITipoDocumento;
  proyectoProrroga?: IProyectoProrroga;
  proyectoSocioPeriodoJustificacion?: IProyectoSocioPeriodoJustificacion;
  proyectoPeriodoSeguimiento?: IProyectoPeriodoSeguimiento;
  comentario: string;
  visible: boolean;
  proyecto: IProyecto;

}

export class NodeDocumento {
  parent: NodeDocumento;
  key: string;
  title: string;
  documento?: StatusWrapper<IDocumentoData>;
  fichero?: IDocumento;
  // tslint:disable-next-line: variable-name
  _level: number;
  tipo: TIPO_DOCUMENTO;
  readonly: boolean;
  // tslint:disable-next-line: variable-name
  _childs: NodeDocumento[];
  get childs(): NodeDocumento[] {
    return this._childs;
  }

  get level(): number {
    return this._level;
  }

  constructor(
    key: string, title: string, level: number,
    documento?: StatusWrapper<IDocumentoData>, readonly?: boolean) {
    this.key = key;
    this.title = title;

    this._level = level;
    if (level === 0 && !title) {
      this.title = SIN_TIPO_FASE;
    } else if ((level === 1 || level === 2) && !title) {
      this.title = SIN_TIPO_DOCUMENTO;
    }
    if (documento) {
      this.documento = documento;
    }

    this._childs = [];
    this.readonly = readonly;
  }

  addChild(child: NodeDocumento) {
    child.parent = this;
    this._childs.push(child);
    this.sortChildsByTitle();
  }

  removeChild(child: NodeDocumento) {
    this._childs = this._childs.filter((documento) => documento !== child);
  }

  sortChildsByTitle(): void {
    this._childs = sortByTitle(this._childs);
  }
}

function sortByTitle(nodes: NodeDocumento[]): NodeDocumento[] {
  return nodes.sort((a, b) => {
    // Force ordering last for level 0 and key 0
    if ((a.level === 0 || b.level === 0) && (a.key.startsWith('0') || b.key.startsWith('0'))) {
      // A is the last
      if (!a.key.startsWith('0')) {
        return 1;
      }
      // B is the last
      if (!b.key.startsWith('0')) {
        return -1;
      }

      // A and B are tipo proyecto but different fase
      if (a.key.startsWith('0') && b.key.startsWith('0') && a.key.endsWith('-0')) {
        return 1;
      }
      return 0;
    }

    // Force ordering last for level 1 and key ?-0
    if ((a.level === 1 || b.level === 1) && (a.key.endsWith('-0') || b.key.endsWith('-0'))) {
      // A is the last
      if (a.key.endsWith('-0')) {
        return 1;
      }
      // B is the last
      if (b.key.endsWith('-0')) {
        return -1;
      }
      return 0;
    }

    if (a.title < b.title) {
      return -1;
    }
    if (a.title > b.title) {
      return 1;
    }
    return 0;
  });
}

export class ProyectoDocumentosFragment extends Fragment {
  documentos$ = new BehaviorSubject<NodeDocumento[]>([]);
  private documentosEliminados: IDocumentoData[] = [];

  private nodeLookup = new Map<string, NodeDocumento>();

  msgParamSeguimientoTitle: string;
  msgParamPeriodoJustificacionTitle: string;
  msgParamProrrogaTitle: string;

  constructor(
    private readonly logger: NGXLogger,
    private proyectoId: number,
    private proyectoService: ProyectoService,
    private proyectoDocumentoService: ProyectoDocumentoService,
    private readonly translate: TranslateService,
  ) {
    super(proyectoId);
    this.setComplete(true);
  }


  protected onInitialize(): void {

    this.setupI18N();
    this.proyectoService.findAllDocumentos(this.proyectoId).pipe(
      map((documentos) => {
        let nodes: NodeDocumento[] = [];
        if (documentos) {
          nodes = nodes.concat(this.buildNodeProyecto(documentos.proyectoDocumentos));
          nodes = nodes.concat(this.buildNodeSeguimiento(documentos.proyectoPeriodoSeguimientoDocumentos));
          nodes = nodes.concat(this.buildNodePeriodoJustificacion(documentos.socioPeriodoJustificacionDocumentos));
          nodes = nodes.concat(this.buildNodeProrroga(documentos.prorrogaDocumentos));
        }
        return nodes;
      })
    ).subscribe((nodes) => {
      this.publishNodes(nodes);
    });
  }



  private buildNodeProyecto(documentos: IProyectoDocumento[]): NodeDocumento[] {
    const nodes: NodeDocumento[] = [];
    if (documentos) {
      documentos.forEach((documento) => {

        const keyTipoFase = `${TIPO_DOCUMENTO.PROYECTO}-${documento.tipoFase ? documento.tipoFase.id : 0}`;
        const keyTipoDocumento = `${TIPO_DOCUMENTO.PROYECTO}-${keyTipoFase}-${documento.tipoDocumento ? documento.tipoDocumento.id : 0}`;
        let faseNode = this.nodeLookup.get(keyTipoFase);
        if (!faseNode) {
          faseNode = new NodeDocumento(keyTipoFase, documento.tipoFase?.nombre, 0);
          this.nodeLookup.set(keyTipoFase, faseNode);
          nodes.push(faseNode);
        }

        let tipoDocNode = this.nodeLookup.get(keyTipoDocumento);
        if (!tipoDocNode) {
          tipoDocNode = new NodeDocumento(keyTipoDocumento, documento.tipoDocumento?.nombre, 1);
          faseNode.addChild(tipoDocNode);
          this.nodeLookup.set(keyTipoDocumento, tipoDocNode);
        }
        const docNode = new NodeDocumento(null, documento.nombre, 2, new StatusWrapper<IDocumentoData>(documento), false);
        tipoDocNode.addChild(docNode);
      });
    }

    return nodes;
  }


  private buildNodeProrroga(documentos: IProyectoProrrogaDocumento[]): NodeDocumento[] {
    const nodes: NodeDocumento[] = [];

    const tipoDocumento = TIPO_DOCUMENTO.PRORROGA;

    if (documentos) {
      documentos.forEach((documento) => {

        const keyDocumento = `${tipoDocumento}`;
        const keyDocumentoTipoDocumento = `${tipoDocumento}-${documento.proyectoProrroga ? documento.proyectoProrroga.numProrroga : 0}-${documento.tipoDocumento ? documento.tipoDocumento.id : 0}`;
        let faseNode = this.nodeLookup.get(keyDocumento);
        let periodoNode: NodeDocumento;
        let keyTipoDocumento: string;


        if (!faseNode) {
          faseNode = new NodeDocumento(keyDocumento, PRORROGA_TITLE, 0);
          this.nodeLookup.set(keyDocumento, faseNode);
          nodes.push(faseNode);
        }

        keyTipoDocumento = `${tipoDocumento}-${documento.proyectoProrroga ? documento.proyectoProrroga.numProrroga : 0}`;
        periodoNode = this.nodeLookup.get(keyTipoDocumento);
        if (!periodoNode) {
          periodoNode = new NodeDocumento(keyTipoDocumento, this.msgParamProrrogaTitle + ' ' + documento.proyectoProrroga.numProrroga, 1);

        }


        faseNode.addChild(periodoNode);
        this.nodeLookup.set(keyTipoDocumento, periodoNode);

        let tipoDocNode = this.nodeLookup.get(keyDocumentoTipoDocumento);
        if (!tipoDocNode) {
          tipoDocNode = new NodeDocumento(keyDocumentoTipoDocumento, documento.tipoDocumento?.nombre, 2);
          periodoNode.addChild(tipoDocNode);
          this.nodeLookup.set(keyDocumentoTipoDocumento, tipoDocNode);
        }
        const docNode = new NodeDocumento(null, documento.nombre, 3, new StatusWrapper<IDocumentoData>(documento as IDocumentoData), true);
        tipoDocNode.addChild(docNode);

      });
    }



    return nodes;
  }


  private buildNodeSeguimiento(documentos: IProyectoPeriodoSeguimientoDocumento[]): NodeDocumento[] {
    const nodes: NodeDocumento[] = [];

    const tipoDocumento = TIPO_DOCUMENTO.SEGUIMIENTO;

    if (documentos) {
      documentos.forEach((documento) => {

        const keyDocumento = `${tipoDocumento}`;
        let keyDocumentoTipoDocumento = `${tipoDocumento}-${documento.proyectoPeriodoSeguimiento ? documento.proyectoPeriodoSeguimiento.numPeriodo : 0}-${documento.tipoDocumento ? documento.tipoDocumento.id : 0}`;
        let faseNode = this.nodeLookup.get(keyDocumento);
        let periodoNode: NodeDocumento;
        let keyTipoDocumento: string;

        if (!faseNode) {
          faseNode = new NodeDocumento(keyDocumento, SEGUIMIENTO_TITLE, 0);
          this.nodeLookup.set(keyDocumento, faseNode);
          nodes.push(faseNode);
        }

        keyTipoDocumento = `${tipoDocumento}-${documento.proyectoPeriodoSeguimiento ? documento.proyectoPeriodoSeguimiento.numPeriodo : 0}`;
        periodoNode = this.nodeLookup.get(keyTipoDocumento);
        if (!periodoNode) {
          periodoNode = new NodeDocumento(keyTipoDocumento, this.msgParamSeguimientoTitle + ' ' + documento.proyectoPeriodoSeguimiento.numPeriodo, 1);

        }


        faseNode.addChild(periodoNode);
        this.nodeLookup.set(keyTipoDocumento, periodoNode);

        let tipoDocNode = this.nodeLookup.get(keyDocumentoTipoDocumento);
        if (!tipoDocNode) {
          tipoDocNode = new NodeDocumento(keyDocumentoTipoDocumento, documento.tipoDocumento?.nombre, 2);
          periodoNode.addChild(tipoDocNode);
          this.nodeLookup.set(keyDocumentoTipoDocumento, tipoDocNode);
        }
        const docNode = new NodeDocumento(null, documento.nombre, 3, new StatusWrapper<IDocumentoData>(documento as IDocumentoData), true);
        tipoDocNode.addChild(docNode);

      });
    }

    return nodes;

  }

  private buildNodePeriodoJustificacion(documentos: ISocioPeriodoJustificacionDocumento[]): NodeDocumento[] {
    const nodes: NodeDocumento[] = [];
    const tipoDocumento = TIPO_DOCUMENTO.PERIODO_JUSTIFICACION;

    if (documentos) {
      documentos.forEach((documento) => {


        const keyDocumento = `${tipoDocumento}`;
        let keyDocumentoTipoDocumento = `${tipoDocumento}-${documento.proyectoSocioPeriodoJustificacion ? documento.proyectoSocioPeriodoJustificacion.numPeriodo : 0}-${documento.tipoDocumento ? documento.tipoDocumento.id : 0}`;
        let faseNode = this.nodeLookup.get(keyDocumento);
        let periodoNode: NodeDocumento;
        let keyTipoDocumento: string;


        if (!faseNode) {
          faseNode = new NodeDocumento(keyDocumento, PERIODO_JUSTIFICACION_TITLE, 0);
          this.nodeLookup.set(keyDocumento, faseNode);
          nodes.push(faseNode);
        }

        keyTipoDocumento = `${tipoDocumento}-${documento.proyectoSocioPeriodoJustificacion ? documento.proyectoSocioPeriodoJustificacion.numPeriodo : 0}`;
        periodoNode = this.nodeLookup.get(keyTipoDocumento);
        if (!periodoNode) {
          periodoNode = new NodeDocumento(keyTipoDocumento, this.msgParamPeriodoJustificacionTitle + ' ' + documento.proyectoSocioPeriodoJustificacion.numPeriodo, 1);

        }

        faseNode.addChild(periodoNode);
        this.nodeLookup.set(keyTipoDocumento, periodoNode);

        let tipoDocNode = this.nodeLookup.get(keyDocumentoTipoDocumento);
        if (!tipoDocNode) {
          tipoDocNode = new NodeDocumento(keyDocumentoTipoDocumento, documento.tipoDocumento?.nombre, 2);
          periodoNode.addChild(tipoDocNode);
          this.nodeLookup.set(keyDocumentoTipoDocumento, tipoDocNode);
        }
        const docNode = new NodeDocumento(null, documento.nombre, 3, new StatusWrapper<IDocumentoData>(documento as IDocumentoData), true);
        tipoDocNode.addChild(docNode);

      });
    }

    return nodes;
  }


  private setupI18N(): void {
    this.translate.get(
      PERIODO_JUSTIFICACION_PERIODO_TITLE
    ).subscribe((value) => this.msgParamPeriodoJustificacionTitle = value);
    this.translate.get(
      SEGUIMIENTO_PERIODO_TITLE
    ).subscribe((value) => this.msgParamSeguimientoTitle = value);
    this.translate.get(
      PRORROGA_PERIODO_TITLE
    ).subscribe((value) => this.msgParamProrrogaTitle = value);
  }

  publishNodes(rootNodes?: NodeDocumento[]) {
    let nodes = rootNodes ? rootNodes : this.documentos$.value;
    nodes = sortByTitle(nodes);
    this.documentos$.next(nodes);
  }

  public addNode(node: NodeDocumento): NodeDocumento {
    const keyTipoFase = `${TIPO_DOCUMENTO.PROYECTO}-${node.documento.value.tipoFase ? node.documento.value.tipoFase.id : 0}`;
    const keyTipoDocumento = `${keyTipoFase}-${node.documento.value.tipoDocumento ? node.documento.value.tipoDocumento.id : 0}`;
    let nodeFase = this.nodeLookup.get(keyTipoFase);
    let addToRoot = false;
    if (!nodeFase) {
      nodeFase = new NodeDocumento(keyTipoFase, node.documento.value.tipoFase?.nombre, 0);
      this.nodeLookup.set(keyTipoFase, nodeFase);
      addToRoot = true;
    }
    let nodeTipoDoc = this.nodeLookup.get(keyTipoDocumento);
    if (!nodeTipoDoc) {
      nodeTipoDoc = new NodeDocumento(keyTipoDocumento, node.documento.value.tipoDocumento?.nombre, 1);
      nodeFase.addChild(nodeTipoDoc);
      this.nodeLookup.set(keyTipoDocumento, nodeTipoDoc);
    }
    const nodeDocumento = new NodeDocumento(keyTipoDocumento, node.title, 2, node.documento);
    nodeDocumento.documento.setCreated();
    nodeDocumento.fichero = node.fichero;
    nodeDocumento.documento.value.documentoRef = node.fichero?.documentoRef;
    nodeDocumento.tipo = TIPO_DOCUMENTO.PROYECTO;
    nodeTipoDoc.addChild(nodeDocumento);
    const current = this.documentos$.value;
    if (addToRoot) {
      current.push(nodeFase);
    }
    this.publishNodes(current);
    this.setChanges(true);
    return nodeDocumento;
  }

  public updateNode(node: NodeDocumento) {
    if (!node.documento.created) {
      node.documento.setEdited();
    }
    node.documento.value.documentoRef = node.fichero?.documentoRef;
    node.tipo = TIPO_DOCUMENTO.PROYECTO;

    const keyTipoFase = `${TIPO_DOCUMENTO.PROYECTO}-${node.documento.value.tipoFase ? node.documento.value.tipoFase.id : 0}`;
    const keyTipoDocumento = `${keyTipoFase}-${node.documento.value.tipoDocumento ? node.documento.value.tipoDocumento.id : 0}`;
    let nodeFase = this.nodeLookup.get(keyTipoFase);
    let addToRoot = false;
    let removedRootNode: NodeDocumento;
    if (!nodeFase) {
      nodeFase = new NodeDocumento(keyTipoFase, node.documento.value.tipoFase?.nombre, 0);
      this.nodeLookup.set(keyTipoFase, nodeFase);
      addToRoot = true;
    }
    let nodeTipoDoc = this.nodeLookup.get(keyTipoDocumento);
    if (!nodeTipoDoc) {
      nodeTipoDoc = new NodeDocumento(keyTipoDocumento, node.documento.value.tipoDocumento?.nombre, 1);
      nodeFase.addChild(nodeTipoDoc);
      this.nodeLookup.set(keyTipoDocumento, nodeTipoDoc);
    }
    // Si el padre ha cambiado limpiamos la rama y establecemos el nuevo padre
    if (nodeTipoDoc !== node.parent) {
      node.parent.removeChild(node);
      removedRootNode = this.removeEmptyParentNodes(node.parent);
      nodeTipoDoc.addChild(node);
    }
    else {
      // Ordenamos los hijos, porque puede haber cambiado el nombre
      node.parent.sortChildsByTitle();
    }
    let current = this.documentos$.value;
    if (removedRootNode) {
      current = current.filter((n) => n !== removedRootNode);
    }
    if (addToRoot) {
      current.push(nodeFase);
    }
    this.publishNodes(current);
    this.setChanges(true);
  }

  public deleteNode(node: NodeDocumento) {
    let removedRootNode: NodeDocumento;

    if (!node.documento.created) {
      this.documentosEliminados.push(node.documento.value);
    }

    node.parent.removeChild(node);
    removedRootNode = this.removeEmptyParentNodes(node.parent);

    let current = this.documentos$.value;
    if (removedRootNode) {
      current = current.filter((n) => n !== removedRootNode);
    }

    this.publishNodes(current);
    this.setChanges(true);
  }

  private removeEmptyParentNodes(node: NodeDocumento): NodeDocumento {
    let removedNode: NodeDocumento;
    if (node.childs.length === 0) {
      this.nodeLookup.delete(node.key);
      if (!node.parent) {
        removedNode = node;
      }
      else {
        node.parent.removeChild(node);
      }
    }
    if (node.parent) {
      removedNode = this.removeEmptyParentNodes(node.parent);
    }
    return removedNode;
  }

  saveOrUpdate(): Observable<void> {
    return merge(
      this.deleteDocumentos(),
      this.updateDocumentos(this.getUpdated(this.documentos$.value)),
      this.createDocumentos(this.getCreated(this.documentos$.value))
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete(this.documentos$.value)) {
          this.setChanges(false);
        }
      })
    );
  }

  private getUpdated(documentos: NodeDocumento[]): NodeDocumento[] {
    const updated: NodeDocumento[] = [];
    documentos.forEach((node) => {
      if (node.documento && node.documento.edited && node.tipo === TIPO_DOCUMENTO.PROYECTO) {
        updated.push(node);
      }
      if (node.childs.length) {
        updated.push(...this.getUpdated(node.childs));
      }
    });
    return updated;
  }

  private getCreated(programas: NodeDocumento[]): NodeDocumento[] {
    const updated: NodeDocumento[] = [];
    programas.forEach((node) => {
      if (node.documento && node.documento.created && node.tipo === TIPO_DOCUMENTO.PROYECTO) {
        updated.push(node);
      }
      if (node.childs.length) {
        updated.push(...this.getCreated(node.childs));
      }
    });
    return updated;
  }

  private deleteDocumentos(): Observable<void> {
    if (this.documentosEliminados.length === 0) {
      return of(void 0);
    }
    return from(this.documentosEliminados).pipe(
      mergeMap((documento) => {
        return this.proyectoDocumentoService.deleteById(documento.id)
          .pipe(
            tap(() => {
              this.documentosEliminados = this.documentosEliminados.filter(deleted =>
                deleted.id !== documento.id);
            })
          );
      }));
  }

  private updateDocumentos(nodes: NodeDocumento[]): Observable<void> {
    if (nodes.length === 0) {
      return of(void 0);
    }
    return from(nodes).pipe(
      mergeMap((node) => {
        if (node.tipo === TIPO_DOCUMENTO.PROYECTO) {
          return this.proyectoDocumentoService.update(node.documento.value.id, node.documento.value as IProyectoDocumento).pipe(
            map((updated) => {
              node.documento = new StatusWrapper<IDocumentoData>(updated);
            })
          );
        }
      }));
  }

  private createDocumentos(nodes: NodeDocumento[]): Observable<void> {
    if (nodes.length === 0) {
      return of(void 0);
    }
    return from(nodes).pipe(
      mergeMap(node => {
        if (node.tipo === TIPO_DOCUMENTO.PROYECTO) {
          node.documento.value.proyecto = {
            id: this.getKey() as number
          } as IProyecto;
          return this.proyectoDocumentoService.create(node.documento.value as IProyectoDocumento).pipe(
            map(created => {
              node.documento = new StatusWrapper<IDocumentoData>(created);
            })
          );
        }
      }));
  }

  private isSaveOrUpdateComplete(nodes: NodeDocumento[]): boolean {
    let pending = this.documentosEliminados.length > 0;
    if (pending) {
      return false;
    }
    nodes.forEach((node) => {
      if (node.documento) {
        pending = node.documento.touched;
        if (pending) {
          return false;
        }
      }
      if (node.childs.length) {
        pending = this.isSaveOrUpdateComplete(node.childs);
        if (pending) {
          return false;
        }
      }
    });
    return true;
  }
}
