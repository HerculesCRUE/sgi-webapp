import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ITipoDocumento } from '@core/models/eti/tipo-documento';
import { Observable, Subscription, of } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { TipoDocumentoService } from '@core/services/eti/tipo-documento.service';
import { SgiRestListResult } from '@sgi/framework/http/types';
import { startWith, map, catchError } from 'rxjs/operators';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { DocumentoService, FileModel } from '@core/services/sgdoc/documento.service';
import { IDocumento } from '@core/models/sgdoc/documento';

const MSG_ERROR_APORTAR_DOCUMENTACION = marker('eti.memoria.documentacion.error.aportar');
const MSG_ERROR_INIT = marker('eti.memoria.documentacion.error.cargar');
const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  templateUrl: './memoria-documentacion-memoria-modal.component.html',
  styleUrls: ['./memoria-documentacion-memoria-modal.component.scss']
})
export class MemoriaDocumentacionMemoriaModalComponent implements OnInit {

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

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
    public readonly matDialogRef: MatDialogRef<MemoriaDocumentacionMemoriaModalComponent>,
    private readonly snackBarService: SnackBarService,
    private readonly tipoDocumentoService: TipoDocumentoService,
    private readonly documentoService: DocumentoService,
    @Inject(MAT_DIALOG_DATA) public documentacionesMemoria: StatusWrapper<IDocumentacionMemoria>[]) {

    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'constructor()', 'start');
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
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {


    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'ngOnInit()', 'start');

    this.initFormGroup();

    this.loadTiposDocumento();

    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'ngOnInit()', 'start');
  }

  /**
   * Inicializa formulario de añadir documentació.
   */
  private initFormGroup() {
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'initFormGroup()', 'start');
    this.formGroup = new FormGroup({
      tipoDocumento: new FormControl(null, [new NullIdValidador().isValid()]),
      nombreDocumento: new FormControl(null),
      fileUpload: new FormControl(null),
    });
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'initFormGroup()', 'end');
  }

  /**
   * Recupera los tips de documento iniciales de una memoria
   */
  loadTiposDocumento() {

    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'loadTiposDocumento()', 'start');
    this.suscripciones.push(
      this.tipoDocumentoService.findTiposDocumentoIniciales().subscribe(
        (res: SgiRestListResult<ITipoDocumento>) => {
          this.tiposDcoumentacionFiltered = res.items;
          this.tiposDcoumentacion = this.formGroup.controls.tipoDocumento.valueChanges
            .pipe(

              startWith(''),
              map(value => this.filtroTipoDocumento(value))
            );
          this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'loadTiposDocumento()', 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'loadTiposDocumento()', 'end');
        }
      )
    );
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'loadTiposDocumento()', 'end');
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




  /**
   * Cierra la ventana modal y devuelve el documento aportado.
   *
   */
  closeModal(documentacionMemoria?: StatusWrapper<IDocumentacionMemoria>): void {
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(documentacionMemoria);
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'closeModal()', 'end');
  }


  save(): void {
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'save()', 'start');
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
        catchError(() => {
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

                this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'save()', 'end');
                this.closeModal(documentacionMemoriaListado);
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
                this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'save()', 'end');
                this.closeModal(wrapperDocumentacion);

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
            this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'save()', 'end');
            this.closeModal(wrapperDocumentacion);

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
    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'onDocumentoSelect()', 'start');
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formGroup.get('fileUpload').setValue(file);
    }

    this.logger.debug(MemoriaDocumentacionMemoriaModalComponent.name, 'onDocumentoSelect()', 'end');
  }

}
