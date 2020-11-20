import { Component, OnInit } from '@angular/core';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IConceptoGasto } from '@core/models/csp/tipos-configuracion';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { Inject } from '@angular/core';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  selector: 'sgi-concepto-gasto-modal',
  templateUrl: './concepto-gasto-modal.component.html',
  styleUrls: ['./concepto-gasto-modal.component.scss']
})
export class ConceptoGastoModalComponent extends
  BaseModalComponent<IConceptoGasto, ConceptoGastoModalComponent> implements OnInit {

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ConceptoGastoModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public conceptoGasto: IConceptoGasto
  ) {
    super(logger, snackBarService, matDialogRef, conceptoGasto);
    this.logger.debug(ConceptoGastoModalComponent.name, 'constructor()', 'start');
    if (conceptoGasto) {
      this.conceptoGasto = { ...conceptoGasto };
    } else {
      this.conceptoGasto = { activo: true } as IConceptoGasto;
    }
    this.logger.debug(ConceptoGastoModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConceptoGastoModalComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.conceptoGasto?.nombre),
      descripcion: new FormControl(this.conceptoGasto?.descripcion),
    });
    this.logger.debug(ConceptoGastoModalComponent.name, 'ngOnInit()', 'end');
  }

  closeModal(conceptoGasto?: IConceptoGasto): void {
    this.logger.debug(ConceptoGastoModalComponent.name, `${this.closeModal.name}(tipoEnlace?: ITipoEnlace)`, 'start');
    this.matDialogRef.close(conceptoGasto);
    this.logger.debug(ConceptoGastoModalComponent.name, `${this.closeModal.name}(tipoEnlace?: ITipoEnlace)`, 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(ConceptoGastoModalComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.getDatosForm();
      this.closeModal(this.conceptoGasto);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ConceptoGastoModalComponent.name, `${this.saveOrUpdate.name}()`, 'end');
  }

  protected getDatosForm(): IConceptoGasto {
    this.logger.debug(ConceptoGastoModalComponent.name, `${this.getDatosForm.name}()`, 'start');
    const conceptoGasto = this.conceptoGasto;
    conceptoGasto.nombre = this.formGroup.get('nombre').value;
    conceptoGasto.descripcion = this.formGroup.get('descripcion').value;
    this.logger.debug(ConceptoGastoModalComponent.name, `${this.getDatosForm.name}()`, 'end');
    return conceptoGasto;
  }

  protected getFormGroup(): FormGroup {
    return new FormGroup({
      nombre: new FormControl(this.conceptoGasto?.nombre),
      descripcion: new FormControl(this.conceptoGasto?.descripcion)
    });
  }

}
