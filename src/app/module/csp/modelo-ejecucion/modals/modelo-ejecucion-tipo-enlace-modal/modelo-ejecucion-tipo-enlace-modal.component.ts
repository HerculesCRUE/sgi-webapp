import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IModeloTipoEnlace } from '@core/models/csp/modelo-tipo-enlace';
import { ITipoEnlace } from '@core/models/csp/tipos-configuracion';
import { TipoEnlaceService } from '@core/services/csp/tipo-enlace.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestListResult } from '@sgi/framework/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ModeloEjecucionTipoEnlaceModalData {
  modeloTipoEnlace: IModeloTipoEnlace;
  tipoEnlaces: ITipoEnlace[];
}

@Component({
  templateUrl: './modelo-ejecucion-tipo-enlace-modal.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-enlace-modal.component.scss']
})
export class ModeloEjecucionTipoEnlaceModalComponent extends
  BaseModalComponent<IModeloTipoEnlace, ModeloEjecucionTipoEnlaceModalComponent> implements OnInit {
  tipoEnlaces$: Observable<ITipoEnlace[]>;

  constructor(
    protected readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ModeloEjecucionTipoEnlaceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModeloEjecucionTipoEnlaceModalData,
    private readonly tipoEnlaceService: TipoEnlaceService,
  ) {
    super(snackBarService, matDialogRef, data.modeloTipoEnlace);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.tipoEnlaces$ = this.tipoEnlaceService.findAll().pipe(
      switchMap((result: SgiRestListResult<ITipoEnlace>) => {
        const list = this.filterExistingTipoEnlace(result);
        return of(list);
      })
    );
  }

  private filterExistingTipoEnlace(result: SgiRestListResult<ITipoEnlace>): ITipoEnlace[] {
    return result.items.filter((tipoEnlace: ITipoEnlace) => {
      return !this.data.tipoEnlaces.find((currentTipo) => currentTipo.id === tipoEnlace.id);
    });
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      tipoEnlace: new FormControl(this.data.modeloTipoEnlace?.tipoEnlace)
    });
    return formGroup;
  }

  protected getDatosForm(): IModeloTipoEnlace {
    const modeloTipoEnlace = this.data.modeloTipoEnlace;
    modeloTipoEnlace.tipoEnlace = this.formGroup.get('tipoEnlace').value;
    return modeloTipoEnlace;
  }
}
