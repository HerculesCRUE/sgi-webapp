import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IModeloUnidad } from '@core/models/csp/modelo-unidad';
import { ITipoUnidadGestion } from '@core/models/csp/tipos-configuracion';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestListResult } from '@sgi/framework/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface IModeloEjecucionTipoUnidadModal {
  modeloTipoUnidad: IModeloUnidad;
  tipoUnidades: ITipoUnidadGestion[];
}

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-unidad-gestion',
  templateUrl: './modelo-ejecucion-tipo-unidad-gestion-modal.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-unidad-gestion-modal.component.scss']
})
export class ModeloEjecucionTipoUnidadGestionModalComponent extends
  BaseModalComponent<IModeloUnidad, ModeloEjecucionTipoUnidadGestionModalComponent> implements OnInit {
  tipoUnidad$: Observable<ITipoUnidadGestion[]>;

  constructor(
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ModeloEjecucionTipoUnidadGestionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IModeloEjecucionTipoUnidadModal,
    private readonly unidadGestionService: UnidadGestionService,
  ) {
    super(snackBarService, matDialogRef, data.modeloTipoUnidad);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.tipoUnidad$ = this.unidadGestionService.findAll().pipe(
      switchMap((result: SgiRestListResult<ITipoUnidadGestion>) => {
        const list = this.filterExistingTipoUnidadGestion(result);
        return of(list);
      })
    );

  }

  private filterExistingTipoUnidadGestion(result: SgiRestListResult<ITipoUnidadGestion>): ITipoUnidadGestion[] {
    return result.items.filter((tipoUnidadGestion: ITipoUnidadGestion) => {
      return !this.data.tipoUnidades.find((currentTipo) => currentTipo.id === tipoUnidadGestion.id);
    });
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      tipoUnidad: new FormControl(this.data.modeloTipoUnidad?.unidadGestion)
    });
    return formGroup;
  }

  protected getDatosForm(): IModeloUnidad {
    const modeloTipoUnidadGestion = this.data.modeloTipoUnidad;
    modeloTipoUnidadGestion.unidadGestion = this.formGroup.get('tipoUnidad').value;
    return modeloTipoUnidadGestion;
  }
}
