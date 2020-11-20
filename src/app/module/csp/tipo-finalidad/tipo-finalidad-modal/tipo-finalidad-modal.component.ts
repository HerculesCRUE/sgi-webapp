import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';

@Component({
  templateUrl: './tipo-finalidad-modal.component.html',
  styleUrls: ['./tipo-finalidad-modal.component.scss']
})
export class TipoFinalidadModalComponent extends BaseModalComponent<ITipoFinalidad, TipoFinalidadModalComponent> implements OnInit {

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<TipoFinalidadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoFinalidad: ITipoFinalidad
  ) {
    super(logger, snackBarService, matDialogRef, tipoFinalidad);
    this.logger.debug(TipoFinalidadModalComponent.name, 'constructor()', 'start');
    if (tipoFinalidad) {
      this.tipoFinalidad = { ...tipoFinalidad };
    } else {
      this.tipoFinalidad = { activo: true } as ITipoFinalidad;
    }
    this.logger.debug(TipoFinalidadModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(TipoFinalidadModalComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.logger.debug(TipoFinalidadModalComponent.name, 'ngOnInit()', 'end');
  }

  protected getDatosForm(): ITipoFinalidad {
    this.logger.debug(TipoFinalidadModalComponent.name, `${this.getDatosForm.name}()`, 'start');
    const tipoFinalidad = this.tipoFinalidad;
    tipoFinalidad.nombre = this.formGroup.get('nombre').value;
    tipoFinalidad.descripcion = this.formGroup.get('descripcion').value;
    this.logger.debug(TipoFinalidadModalComponent.name, `${this.getDatosForm.name}()`, 'end');
    return tipoFinalidad;
  }

  protected getFormGroup(): FormGroup {
    return new FormGroup({
      nombre: new FormControl(this.tipoFinalidad?.nombre),
      descripcion: new FormControl(this.tipoFinalidad?.descripcion)
    });
  }

}
