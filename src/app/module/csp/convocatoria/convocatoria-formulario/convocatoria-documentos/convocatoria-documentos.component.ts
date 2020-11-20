import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaDocumento } from '@core/models/csp/convocatoria-documento';
import { ITipoDocumento, ITipoFase } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { Group } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { DialogService } from '@core/services/dialog.service';
import { DocumentoService, FileModel, triggerDownloadToUser } from '@core/services/sgdoc/documento.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaDocumentosFragment, NodeDocumento } from './convocatoria-documentos.fragment';

const MSG_DELETE = marker('csp.convocatoria.documentos.documento.eliminar.msg');
const MSG_UPLOAD_SUCCES = marker('file.upload.success');
const MSG_UPLOAD_ERROR = marker('file.upload.error');
const MSG_DOWNLOAD_ERROR = marker('file.download.error');
const MSG_FILE_NOT_FOUND_ERROR = marker('file.info.error');

enum VIEW_MODE {
  NONE = '',
  VIEW = 'view',
  NEW = 'new',
  EDIT = 'edit'
}

@Component({
  selector: 'sgi-convocatoria-documentos',
  templateUrl: './convocatoria-documentos.component.html',
  styleUrls: ['./convocatoria-documentos.component.scss']
})
export class ConvocatoriaDocumentosComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ConvocatoriaDocumentosFragment;
  private subscriptions = [] as Subscription[];

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  treeControl: FlatTreeControl<NodeDocumento>;
  private treeFlattener: MatTreeFlattener<NodeDocumento, NodeDocumento>;
  dataSource: MatTreeFlatDataSource<NodeDocumento, NodeDocumento>;

  viewingNode: NodeDocumento;
  viewMode = VIEW_MODE.NONE;

  group = new Group();
  get formGroup(): FormGroup {
    return this.group.form;
  }

  fileToUpload: FileModel;
  fases: ITipoFase[] = [];
  tiposDocumento: ITipoDocumento[] = [];

  disableUpload = true;

  private tipoDocumentosFase = new Map<number, ITipoDocumento[]>();

  private getLevel = (node: NodeDocumento) => node.level;
  private isExpandable = (node: NodeDocumento) => node.childs.length > 0;
  private getChildren = (node: NodeDocumento): NodeDocumento[] => node.childs;
  private transformer = (node: NodeDocumento, level: number) => node;

  hasChild = (_: number, node: NodeDocumento) => node.childs.length > 0;

  compareFase = (option: ITipoFase, value: ITipoFase) => option?.id === value?.id;
  compareTipoDocumento = (option: ITipoDocumento, value: ITipoDocumento) => option?.id === value?.id;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly dialogService: DialogService,
    public actionService: ConvocatoriaActionService,
    private modeloEjecucionService: ModeloEjecucionService,
    private documentoService: DocumentoService,
    private snackBar: SnackBarService
  ) {
    super(actionService.FRAGMENT.DOCUMENTOS, actionService);
    this.logger.debug(ConvocatoriaDocumentosComponent.name, 'constructor()', 'start');
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.formPart = this.fragment as ConvocatoriaDocumentosFragment;

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<NodeDocumento>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.logger.debug(ConvocatoriaDocumentosComponent.name, 'constructor()', 'end');
  }

  ngOnInit() {
    super.ngOnInit();
    this.logger.debug(ConvocatoriaDocumentosComponent.name, 'ngOnInit()', 'start');
    this.subscriptions.push(this.formPart.documentos$.subscribe((documentos) => {
      this.dataSource.data = documentos;
    }));
    this.group.load(new FormGroup({
      nombre: new FormControl('', Validators.required),
      fichero: new FormControl({ value: null, disabled: this.disableUpload }, Validators.required),
      fase: new FormControl(null, IsEntityValidator.isValid),
      tipoDocumento: new FormControl(null, IsEntityValidator.isValid),
      publico: new FormControl(null, Validators.required),
      observaciones: new FormControl('')
    }));
    this.group.initialize();
    this.subscriptions.push(this.modeloEjecucionService.findModeloTipoDocumento(this.actionService.modeloEjecucionId).subscribe(
      (tipos) => {
        const fases = new Map<number, ITipoFase>();

        tipos.items.forEach((tipo) => {
          const idTipoFase = tipo.modeloTipoFase ? tipo.modeloTipoFase.tipoFase.id : null;
          if (idTipoFase) {
            let tipoFase = fases.get(idTipoFase);
            if (!tipoFase) {
              tipoFase = tipo.modeloTipoFase.tipoFase;
              fases.set(idTipoFase, tipoFase);
            }
          }
          let tiposDocumentos = this.tipoDocumentosFase.get(idTipoFase);
          if (!tiposDocumentos) {
            tiposDocumentos = [];
            this.tipoDocumentosFase.set(idTipoFase, tiposDocumentos);
          }
          tiposDocumentos.push(tipo.tipoDocumento);
        });
        fases.forEach((fase) => {
          this.fases.push(fase);
        });
      })
    );
    this.subscriptions.push(this.formGroup.controls.fase.valueChanges.subscribe((value: ITipoFase) => {
      if (this.viewMode === VIEW_MODE.EDIT || this.viewMode === VIEW_MODE.NEW) {
        this.formGroup.controls.tipoDocumento.reset();
      }
      this.tiposDocumento = this.tipoDocumentosFase.get(value ? value.id : null);
    }));
    this.switchToNone();
    this.logger.debug(ConvocatoriaDocumentosComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy() {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaDocumentosComponent.name, 'ngOnDestroy()', 'end');
  }

  showNodeDetails(node: NodeDocumento) {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.showNodeDetails.name}(node: ${node})`, 'start');
    this.viewingNode = node;
    if (!node.fichero && node.documento?.value.documentoRef) {
      this.subscriptions.push(this.documentoService.getInfoFichero(node.documento.value.documentoRef).subscribe(
        (info) => {
          node.fichero = info;
          this.switchToView();
        },
        () => {
          // TODO: Eliminar cuando los datos sean consistentens
          this.snackBar.showError(MSG_FILE_NOT_FOUND_ERROR);
          this.switchToView();
        }
      ));
    }
    else {
      this.switchToView();
    }
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.showNodeDetails.name}(node: ${node})`, 'end');
  }

  hideNodeDetails() {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.hideNodeDetails.name}()`, 'start');
    this.viewMode = VIEW_MODE.NONE;
    this.viewingNode = undefined;
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.hideNodeDetails.name}()`, 'end');
  }

  switchToNew() {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.switchToNew.name}()`, 'start');
    const wrapper = new StatusWrapper<IConvocatoriaDocumento>({} as IConvocatoriaDocumento);
    const newNode: NodeDocumento = new NodeDocumento(null, undefined, 2, wrapper);
    this.viewMode = VIEW_MODE.NEW;
    this.viewingNode = newNode;
    this.loadDetails(this.viewingNode);
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.switchToNew.name}()`, 'end');
  }

  switchToEdit() {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.switchToEdit.name}()`, 'start');
    this.viewMode = VIEW_MODE.EDIT;
    this.loadDetails(this.viewingNode);
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.switchToEdit.name}()`, 'end');
  }

  switchToView() {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.switchToView.name}()`, 'start');
    this.viewMode = VIEW_MODE.VIEW;
    this.loadDetails(this.viewingNode);
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.switchToView.name}()`, 'end');
  }

  private switchToNone() {
    this.viewMode = VIEW_MODE.NONE;
    this.viewingNode = undefined;
    this.loadDetails(undefined);
  }

  private loadDetails(node: NodeDocumento) {
    this.logger.debug(ConvocatoriaDocumentosComponent.name,
      `${this.loadDetails.name}()`, 'start');
    this.formGroup.enable();
    this.setUploadDisabled(false);

    this.formGroup.reset();
    this.formGroup.get('nombre').patchValue(node?.documento?.value?.nombre);
    this.formGroup.get('fichero').patchValue(node?.fichero?.nombre);
    this.formGroup.get('fase').setValue(node?.documento?.value?.tipoFase);
    this.formGroup.get('tipoDocumento').patchValue(node?.documento?.value?.tipoDocumento);
    this.formGroup.get('publico').patchValue(node?.documento?.value?.publico);
    this.formGroup.get('observaciones').patchValue(node?.documento?.value?.observaciones);

    this.group.refreshInitialState(Boolean(node?.documento));
    if (this.viewMode !== VIEW_MODE.NEW && this.viewMode !== VIEW_MODE.EDIT) {
      this.formGroup.disable();
      this.setUploadDisabled(true);
    }

    this.logger.debug(ConvocatoriaDocumentosComponent.name,
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

  private getDetailNode(): NodeDocumento {
    const detail = this.viewingNode;
    detail.documento.value.nombre = this.formGroup.get('nombre').value;
    detail.title = detail.documento.value.nombre;
    detail.documento.value.tipoFase = this.formGroup.get('fase').value;
    detail.documento.value.tipoDocumento = this.formGroup.get('tipoDocumento').value;
    detail.documento.value.publico = this.formGroup.get('publico').value;
    detail.documento.value.observaciones = this.formGroup.get('observaciones').value;
    return detail;
  }

  private addNode(node: NodeDocumento) {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.addNode.name}()`, 'start');

    const createdNode = this.formPart.addNode(node);
    this.expandParents(createdNode);
    this.switchToNone();

    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.addNode.name}()`, 'end');
  }

  private updateNode(node: NodeDocumento) {
    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.updateNode.name}()`, 'start');

    this.formPart.updateNode(node);
    this.expandParents(node);
    this.switchToView();

    this.logger.debug(ConvocatoriaDocumentosComponent.name, `${this.updateNode.name}()`, 'end');
  }

  private expandParents(node: NodeDocumento) {
    if (node.parent) {
      this.treeControl.expand(node.parent);
      this.expandParents(node.parent);
    }
  }

  deleteDetail() {
    this.logger.debug(ConvocatoriaDocumentosComponent.name,
      `${this.deleteDetail.name}()`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteNode(this.viewingNode);
            this.switchToNone();
          }
        }
      )
    );
    this.logger.debug(ConvocatoriaDocumentosComponent.name,
      `${this.deleteDetail.name}()`, 'end');
  }

  private setUploadDisabled(value: boolean) {
    if (value) {
      this.disableUpload = true;
      this.formGroup.controls.fichero.disable();
    }
    else {
      this.disableUpload = false;
      this.formGroup.controls.fichero.enable();
    }
  }

  onSeletectFile(files: FileList) {
    if (files && files.length) {
      this.fileToUpload = {
        progress: 0,
        file: files.item(0),
        status: undefined
      };
      this.setUploadDisabled(true);
      this.subscriptions.push(this.documentoService.uploadFichero(this.fileToUpload).subscribe(
        (fileModel) => {
          this.snackBar.showSuccess(MSG_UPLOAD_SUCCES);
          this.viewingNode.fichero = fileModel;
          this.formGroup.controls.fichero.setValue(fileModel.nombre);
          this.setUploadDisabled(false);
        },
        () => {
          this.fileToUpload.status = 'error';
          this.snackBar.showError(MSG_UPLOAD_ERROR);
          this.setUploadDisabled(false);
        }
      ));
    }
    else {
      this.fileToUpload = undefined;
    }
  }

  downloadFile(node: NodeDocumento): void {
    this.subscriptions.push(this.documentoService.downloadFichero(node.fichero.documentoRef).subscribe(
      (data) => {
        triggerDownloadToUser(data, node.fichero.nombre);
      },
      () => {
        this.snackBar.showError(MSG_DOWNLOAD_ERROR);
      }
    ));
  }
}
