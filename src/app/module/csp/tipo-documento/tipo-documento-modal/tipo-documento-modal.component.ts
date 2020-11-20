import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { ITipoDocumento } from '@core/models/csp/tipos-configuracion';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';

@Component({
  templateUrl: './tipo-documento-modal.component.html',
  styleUrls: ['./tipo-documento-modal.component.scss']
})
export class TipoDocumentoModalComponent extends BaseModalComponent<ITipoDocumento, TipoDocumentoModalComponent> implements OnInit {

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoDocumentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoDocumento: ITipoDocumento
  ) {
    super(logger, snackBarService, matDialogRef, tipoDocumento);
    this.logger.debug(TipoDocumentoModalComponent.name, 'constructor()', 'start');
    if (tipoDocumento) {
      this.tipoDocumento = { ...tipoDocumento };
    } else {
      this.tipoDocumento = { activo: true } as ITipoDocumento;
    }
    this.logger.debug(TipoDocumentoModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoDocumentoModalComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.logger.debug(TipoDocumentoModalComponent.name, 'ngOnInit()', 'end');
  }

  protected getDatosForm(): ITipoDocumento {
    this.logger.debug(TipoDocumentoModalComponent.name, `${this.getDatosForm.name}()`, 'start');
    const tipoDocumento = this.tipoDocumento;
    tipoDocumento.nombre = this.formGroup.get('nombre').value;
    tipoDocumento.descripcion = this.formGroup.get('descripcion').value;
    this.logger.debug(TipoDocumentoModalComponent.name, `${this.getDatosForm.name}()`, 'end');
    return tipoDocumento;
  }

  protected getFormGroup(): FormGroup {
    return new FormGroup({
      nombre: new FormControl(this.tipoDocumento?.nombre),
      descripcion: new FormControl(this.tipoDocumento?.descripcion)
    });
  }
}
