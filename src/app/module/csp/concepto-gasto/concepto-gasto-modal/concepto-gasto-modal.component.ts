import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IConceptoGasto } from '@core/models/csp/tipos-configuracion';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  selector: 'sgi-concepto-gasto-modal',
  templateUrl: './concepto-gasto-modal.component.html',
  styleUrls: ['./concepto-gasto-modal.component.scss']
})
export class ConceptoGastoModalComponent extends
  BaseModalComponent<IConceptoGasto, ConceptoGastoModalComponent> implements OnInit {

  constructor(
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ConceptoGastoModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public conceptoGasto: IConceptoGasto
  ) {
    super(snackBarService, matDialogRef, conceptoGasto);
    if (conceptoGasto) {
      this.conceptoGasto = { ...conceptoGasto };
    } else {
      this.conceptoGasto = { activo: true } as IConceptoGasto;
    }
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.conceptoGasto?.nombre),
      descripcion: new FormControl(this.conceptoGasto?.descripcion),
    });
  }

  closeModal(conceptoGasto?: IConceptoGasto): void {
    this.matDialogRef.close(conceptoGasto);
  }

  saveOrUpdate(): void {
    if (FormGroupUtil.valid(this.formGroup)) {
      this.getDatosForm();
      this.closeModal(this.conceptoGasto);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
  }

  protected getDatosForm(): IConceptoGasto {
    const conceptoGasto = this.conceptoGasto;
    conceptoGasto.nombre = this.formGroup.get('nombre').value;
    conceptoGasto.descripcion = this.formGroup.get('descripcion').value;
    return conceptoGasto;
  }

  protected getFormGroup(): FormGroup {
    return new FormGroup({
      nombre: new FormControl(this.conceptoGasto?.nombre),
      descripcion: new FormControl(this.conceptoGasto?.descripcion)
    });
  }

}
