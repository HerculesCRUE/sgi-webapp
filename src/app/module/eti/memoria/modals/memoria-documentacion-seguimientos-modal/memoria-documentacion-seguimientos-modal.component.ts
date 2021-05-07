import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MSG_PARAMS } from '@core/i18n';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { ITipoDocumento } from '@core/models/eti/tipo-documento';
import { IDocumento } from '@core/models/sgdoc/documento';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DocumentoService, FileModel } from '@core/services/sgdoc/documento.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

const MSG_ERROR_APORTAR_DOCUMENTACION = marker('error.eti.memoria.documentacion.aportar');
const MSG_ERROR_FORM_GROUP = marker('error.form-group');
const TITLE_NEW_ENTITY = marker('title.new.entity');
const DOCUMENTO_KEY = marker('eti.memoria.documento');

@Component({
  templateUrl: './memoria-documentacion-seguimientos-modal.component.html',
  styleUrls: ['./memoria-documentacion-seguimientos-modal.component.scss']
})
export class MemoriaDocumentacionSeguimientosModalComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;

  fxLayoutProperties: FxLayoutProperties;

  tiposDcoumentacionFiltered: ITipoDocumento[];
  tiposDcoumentacion: Observable<ITipoDocumento[]>;

  suscripciones: Subscription[] = [];

  title: string;

  constructor(
    private readonly logger: NGXLogger,
    public readonly matDialogRef: MatDialogRef<MemoriaDocumentacionSeguimientosModalComponent>,
    private readonly snackBarService: SnackBarService,
    private readonly documentoService: DocumentoService,
    @Inject(MAT_DIALOG_DATA) public documentacionesMemoria: StatusWrapper<IDocumentacionMemoria>[],
    private readonly translate: TranslateService) {

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.setupI18N();
  }

  private setupI18N(): void {
    this.translate.get(
      DOCUMENTO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          TITLE_NEW_ENTITY,
          { entity: value, ...MSG_PARAMS.GENDER.MALE }
        );
      })
    ).subscribe((value) => this.title = value);
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

  saveOrUpdate(): void {
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
          this.matDialogRef.close(wrapperDocumentacion);
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
