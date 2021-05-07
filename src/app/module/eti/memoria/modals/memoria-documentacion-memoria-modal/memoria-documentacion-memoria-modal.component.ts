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
import { TipoDocumentoService } from '@core/services/eti/tipo-documento.service';
import { DocumentoService, FileModel } from '@core/services/sgdoc/documento.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { TranslateService } from '@ngx-translate/core';
import { SgiRestListResult } from '@sgi/framework/http/types';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

const MSG_ERROR_APORTAR_DOCUMENTACION = marker('error.eti.memoria.documentacion.aportar');
const MSG_ERROR_INIT = marker('error.load');
const MSG_ERROR_FORM_GROUP = marker('error.form-group');
const TITLE_NEW_ENTITY = marker('title.new.entity');
const DOCUMENTO_KEY = marker('eti.memoria.documento');
const DOCUMENTO_TIPO_KEY = marker('eti.memoria.documento.tipo');

@Component({
  templateUrl: './memoria-documentacion-memoria-modal.component.html',
  styleUrls: ['./memoria-documentacion-memoria-modal.component.scss']
})
export class MemoriaDocumentacionMemoriaModalComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;

  tiposDcoumentacionFiltered: ITipoDocumento[];
  tiposDcoumentacion: Observable<ITipoDocumento[]>;

  suscripciones: Subscription[] = [];

  title: string;
  msgParamTipoEntity = {};

  constructor(
    private readonly logger: NGXLogger,
    public readonly matDialogRef: MatDialogRef<MemoriaDocumentacionMemoriaModalComponent>,
    private readonly snackBarService: SnackBarService,
    private readonly tipoDocumentoService: TipoDocumentoService,
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
    this.loadTiposDocumento();
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

    this.translate.get(
      DOCUMENTO_TIPO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamTipoEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });
  }

  /**
   * Inicializa formulario de añadir documentació.
   */
  private initFormGroup() {
    this.formGroup = new FormGroup({
      tipoDocumento: new FormControl(null, [new NullIdValidador().isValid()]),
      nombreDocumento: new FormControl(null),
      fileUpload: new FormControl(null),
    });
  }

  /**
   * Recupera los tips de documento iniciales de una memoria
   */
  loadTiposDocumento() {
    this.suscripciones.push(
      this.tipoDocumentoService.findTiposDocumentoIniciales().subscribe(
        (res: SgiRestListResult<ITipoDocumento>) => {
          this.tiposDcoumentacionFiltered = res.items;
          this.tiposDcoumentacion = this.formGroup.controls.tipoDocumento.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroTipoDocumento(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  /**
   * Filtra la lista devuelta por el servicio.
   *
   * @param value del input para autocompletar
   */
  filtroTipoDocumento(value: string): ITipoDocumento[] {
    const filterValue = value.toString().toLowerCase();
    return this.tiposDcoumentacionFiltered.filter(tipoDocumento => tipoDocumento.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre de un tipo de documento.
   * @param tipoDocumento tipo de documento.
   * @returns nombre de un tipo de documento.
   */
  getTipoDocumento(tipoDocumento?: ITipoDocumento): string | undefined {
    return typeof tipoDocumento === 'string' ? tipoDocumento : tipoDocumento?.nombre;
  }

  saveOrUpdate(): void {
    if (FormGroupUtil.valid(this.formGroup)) {
      let existDocumentacion = false;
      let documentacionMemoria: IDocumentacionMemoria = {} as IDocumentacionMemoria;
      const fileModel = {
        file: this.formGroup.controls.fileUpload.value
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
          if (this.documentacionesMemoria.length > 0) {
            this.documentacionesMemoria.map(documentacionMemoriaListado => {
              if (documentacionMemoriaListado.value.tipoDocumento.nombre === this.formGroup.controls.tipoDocumento.value.nombre
                && !documentacionMemoriaListado.value.aportado) {
                documentacionMemoriaListado.value.documentoRef = documentoRefGenerado;
                documentacionMemoriaListado.value.tipoDocumento = this.formGroup.controls.tipoDocumento.value;
                if (documentacionMemoriaListado.value.id) {
                  documentacionMemoriaListado.setEdited();
                }
                documentacionMemoriaListado.value.aportado = true;
                existDocumentacion = true;
                this.matDialogRef.close(documentacionMemoriaListado);
              }
              if (!existDocumentacion) {
                this.documentacionesMemoria = [];
                documentacionMemoria = {
                  id: null,
                  aportado: true,
                  tipoDocumento: this.formGroup.controls.tipoDocumento.value,
                  documentoRef: documentoRefGenerado,
                  memoria: null,
                  fichero: this.formGroup.controls.fileUpload.value
                };
                const wrapperDocumentacion: StatusWrapper<IDocumentacionMemoria> =
                  new StatusWrapper<IDocumentacionMemoria>(documentacionMemoria);
                wrapperDocumentacion.setCreated();
                this.documentacionesMemoria.push(wrapperDocumentacion);
                this.matDialogRef.close(wrapperDocumentacion);
              }
            });
          } else {
            this.documentacionesMemoria = [];
            documentacionMemoria = {
              id: null,
              aportado: true,
              tipoDocumento: this.formGroup.controls.tipoDocumento.value,
              documentoRef: documentoRefGenerado,
              memoria: null,
              fichero: this.formGroup.controls.fileUpload.value
            };
            const wrapperDocumentacion: StatusWrapper<IDocumentacionMemoria> =
              new StatusWrapper<IDocumentacionMemoria>(documentacionMemoria);
            wrapperDocumentacion.setCreated();
            this.documentacionesMemoria.push(wrapperDocumentacion);
            this.matDialogRef.close(wrapperDocumentacion);
          }
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
