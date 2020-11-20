import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  selector: 'sgi-tipo-financiacion-modal',
  templateUrl: './tipo-financiacion-modal.component.html',
  styleUrls: ['./tipo-financiacion-modal.component.scss']
})
export class TipoFinanciacionModalComponent implements OnInit {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  public tipoFinanciacion: ITipoFinanciacion;

  constructor(
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoFinanciacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) tipoFinanciacion: ITipoFinanciacion
  ) {
    this.logger.debug(TipoFinanciacionModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    if (tipoFinanciacion) {
      this.tipoFinanciacion = { ...tipoFinanciacion };
    } else {
      this.tipoFinanciacion = { activo: true } as ITipoFinanciacion;
    }
    this.logger.debug(TipoFinanciacionModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoFinanciacionModalComponent.name, 'ngOnInit()', 'start');
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.tipoFinanciacion?.nombre),
      descripcion: new FormControl(this.tipoFinanciacion?.descripcion),
    });
    this.logger.debug(TipoFinanciacionModalComponent.name, 'ngOnInit()', 'end');
  }

  closeModal(tipoFinanciacion?: ITipoFinanciacion): void {
    this.logger.debug(TipoFinanciacionModalComponent.name, `${this.closeModal.name}(tipoFinanciacion: ${tipoFinanciacion})`, 'start');
    this.matDialogRef.close(tipoFinanciacion);
    this.logger.debug(TipoFinanciacionModalComponent.name, `${this.closeModal.name}(tipoFinanciacion: ${tipoFinanciacion})`, 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(TipoFinanciacionModalComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.tipoFinanciacion);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(TipoFinanciacionModalComponent.name, `${this.saveOrUpdate.name}()`, 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private loadDatosForm(): void {
    this.logger.debug(TipoFinanciacionModalComponent.name, `${this.loadDatosForm.name}()`, 'start');
    this.tipoFinanciacion.nombre = this.formGroup.get('nombre').value;
    this.tipoFinanciacion.descripcion = this.formGroup.get('descripcion').value;
    this.logger.debug(TipoFinanciacionModalComponent.name, `${this.loadDatosForm.name}()`, 'end');
  }

}
