import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { ITipoDocumento } from '@core/models/eti/tipo-documento';
import { IDocumento } from '@core/models/sgdoc/documento';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DocumentoService, FileModel } from '@core/services/sgdoc/documento.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


const MSG_ERROR_APORTAR_DOCUMENTACION = marker('eti.memoria.documentacion.error.aportar');
const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  templateUrl: './memoria-documentacion-seguimientos-modal.component.html',
  styleUrls: ['./memoria-documentacion-seguimientos-modal.component.scss']
})
export class MemoriaDocumentacionSeguimientosModalComponent implements OnInit {

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;

  fxFlexProperties: FxFlexProperties;
  fxFlexProperties2: FxFlexProperties;
  fxFlexProperties3: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  tiposDcoumentacionFiltered: ITipoDocumento[];
  tiposDcoumentacion: Observable<ITipoDocumento[]>;

  suscripciones: Subscription[] = [];

  constructor(
    private readonly logger: NGXLogger,
    public readonly matDialogRef: MatDialogRef<MemoriaDocumentacionSeguimientosModalComponent>,
    private readonly snackBarService: SnackBarService,
    private readonly documentoService: DocumentoService,
    @Inject(MAT_DIALOG_DATA) public documentacionesMemoria: StatusWrapper<IDocumentacionMemoria>[]) {

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(15%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexProperties2 = new FxFlexProperties();
    this.fxFlexProperties2.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.order = '3';

    this.fxFlexProperties3 = new FxFlexProperties();
    this.fxFlexProperties3.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    this.initFormGroup();
  }

  /**
   * Inicializa formulario de añadir documentació.
   */
  private initFormGroup() {
    this.formGroup = new FormGroup({
      nombreDocumento: new FormControl(null),
      fileUpload: new FormControl(null),
    });
  }

  /**
   * Cierra la ventana modal y devuelve el documento aportado.
   *
   */
  closeModal(documentacionMemoria?: StatusWrapper<IDocumentacionMemoria>): void {
    this.matDialogRef.close(documentacionMemoria);
  }

  save(): void {
    if (FormGroupUtil.valid(this.formGroup)) {
      let documentacionMemoria: IDocumentacionMemoria = {} as IDocumentacionMemoria;
      const fileModel = {
        file: FormGroupUtil.getValue(this.formGroup, 'fileUpload')
      } as FileModel;
      this.documentoService.uploadFichero(fileModel).pipe(
        map((documentoSgdoc: IDocumento) => {
          return documentoSgdoc.documentoRef;
        }),
        catchError((error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_APORTAR_DOCUMENTACION);
          return of();
        })).subscribe((documentoRefGenerado: string) => {
          this.documentacionesMemoria = [];
          documentacionMemoria = {
            id: null,
            aportado: true,
            tipoDocumento: null,
            documentoRef: documentoRefGenerado,
            memoria: null,
            fichero: FormGroupUtil.getValue(this.formGroup, 'fileUpload')
          };
          const wrapperDocumentacion: StatusWrapper<IDocumentacionMemoria> =
            new StatusWrapper<IDocumentacionMemoria>(documentacionMemoria);
          wrapperDocumentacion.setCreated();
          this.documentacionesMemoria.push(wrapperDocumentacion);
          this.closeModal(wrapperDocumentacion);
        });
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
  }



  /**
   * Rellena el campo del formulario con el fichero seleccionado.
   */
  onDocumentoSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formGroup.get('fileUpload').setValue(file);
    }
  }

}
