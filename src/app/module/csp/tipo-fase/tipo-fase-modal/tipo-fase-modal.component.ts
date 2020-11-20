import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  selector: 'sgi-tipo-fase-modal',
  templateUrl: './tipo-fase-modal.component.html',
  styleUrls: ['./tipo-fase-modal.component.scss']
})
export class TipoFaseModalComponent implements OnInit {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;

  constructor(
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoFaseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoFase: ITipoFase
  ) {
    this.logger.debug(TipoFaseModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    if (tipoFase) {
      this.tipoFase = { ...tipoFase };
    } else {
      this.tipoFase = { activo: true } as ITipoFase;
    }
    this.logger.debug(TipoFaseModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoFaseModalComponent.name, 'ngOnInit()', 'start');
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.tipoFase?.nombre),
      descripcion: new FormControl(this.tipoFase?.descripcion)
    });
    this.logger.debug(TipoFaseModalComponent.name, 'ngOnInit()', 'end');
  }

  closeModal(tipoFase?: ITipoFase): void {
    this.logger.debug(TipoFaseModalComponent.name, `${this.closeModal.name}()`, 'start');
    this.matDialogRef.close(tipoFase);
    this.logger.debug(TipoFaseModalComponent.name, `${this.closeModal.name}()`, 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(TipoFaseModalComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.tipoFase);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(TipoFaseModalComponent.name, `${this.saveOrUpdate.name}()`, 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private loadDatosForm(): void {
    this.logger.debug(TipoFaseModalComponent.name, `${this.loadDatosForm.name}()`, 'start');
    this.tipoFase.nombre = this.formGroup.get('nombre').value;
    this.tipoFase.descripcion = this.formGroup.get('descripcion').value;
    this.logger.debug(TipoFaseModalComponent.name, `${this.loadDatosForm.name}()`, 'end');
  }

}

