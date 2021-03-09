import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IModeloTipoFinalidad } from '@core/models/csp/modelo-tipo-finalidad';
import { ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { TipoFinalidadService } from '@core/services/csp/tipo-finalidad.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestListResult } from '@sgi/framework/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ModeloEjecucionTipoFinalidadModalData {
  modeloTipoFinalidad: IModeloTipoFinalidad;
  tipoFinalidades: ITipoFinalidad[];
}

@Component({
  templateUrl: './modelo-ejecucion-tipo-finalidad-modal.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-finalidad-modal.component.scss']
})
export class ModeloEjecucionTipoFinalidadModalComponent extends
  BaseModalComponent<IModeloTipoFinalidad, ModeloEjecucionTipoFinalidadModalComponent> implements OnInit {

  tipoFinalidad$: Observable<ITipoFinalidad[]>;

  constructor(
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ModeloEjecucionTipoFinalidadModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModeloEjecucionTipoFinalidadModalData,
    private readonly tipoFinalidadService: TipoFinalidadService
  ) {
    super(snackBarService, matDialogRef, data.modeloTipoFinalidad);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.tipoFinalidad$ = this.tipoFinalidadService.findAll().pipe(
      switchMap((result: SgiRestListResult<ITipoFinalidad>) => {
        const list = this.filterExistingTipoFinalidad(result);
        return of(list);
      })
    );
  }

  private filterExistingTipoFinalidad(result: SgiRestListResult<ITipoFinalidad>): ITipoFinalidad[] {
    return result.items.filter((tipoFinalidad: ITipoFinalidad) => {
      return this.data.tipoFinalidades.find((currentTipo) => currentTipo.id === tipoFinalidad.id) ? false : true;
    });
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      tipoFinalidad: new FormControl(this.data.modeloTipoFinalidad?.tipoFinalidad)
    });
    return formGroup;
  }

  protected getDatosForm(): IModeloTipoFinalidad {
    const modeloTipoFinalidad = this.data.modeloTipoFinalidad;
    modeloTipoFinalidad.tipoFinalidad = this.formGroup.get('tipoFinalidad').value;
    return modeloTipoFinalidad;
  }
}
