import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ITipoEnlace } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  templateUrl: './tipo-enlace-modal.component.html',
  styleUrls: ['./tipo-enlace-modal.component.scss']
})
export class TipoEnlaceModalComponent implements OnInit {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;

  constructor(
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoEnlaceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoEnlace: ITipoEnlace
  ) {
    this.logger.debug(TipoEnlaceModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    if (tipoEnlace) {
      this.tipoEnlace = { ...tipoEnlace };
    } else {
      this.tipoEnlace = { activo: true } as ITipoEnlace;
    }
    this.logger.debug(TipoEnlaceModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoEnlaceModalComponent.name, 'ngOnInit()', 'start');
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.tipoEnlace?.nombre),
      descripcion: new FormControl(this.tipoEnlace?.descripcion)
    });
    this.logger.debug(TipoEnlaceModalComponent.name, 'ngOnInit()', 'end');
  }

  closeModal(tipoEnlace?: ITipoEnlace): void {
    this.logger.debug(TipoEnlaceModalComponent.name, `${this.closeModal.name}(tipoEnlace?: ITipoEnlace)`, 'start');
    this.matDialogRef.close(tipoEnlace);
    this.logger.debug(TipoEnlaceModalComponent.name, `${this.closeModal.name}(tipoEnlace?: ITipoEnlace)`, 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(TipoEnlaceModalComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.tipoEnlace);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(TipoEnlaceModalComponent.name, `${this.saveOrUpdate.name}()`, 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private loadDatosForm(): void {
    this.logger.debug(TipoEnlaceModalComponent.name, `${this.loadDatosForm.name}()`, 'start');
    this.tipoEnlace.nombre = this.formGroup.get('nombre').value;
    this.tipoEnlace.descripcion = this.formGroup.get('descripcion').value;
    this.logger.debug(TipoEnlaceModalComponent.name, `${this.loadDatosForm.name}()`, 'end');
  }

}
