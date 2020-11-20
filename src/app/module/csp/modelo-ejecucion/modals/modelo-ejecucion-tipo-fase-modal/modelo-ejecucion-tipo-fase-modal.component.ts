import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { TipoFaseService } from '@core/services/csp/tipo-fase.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogService } from '@core/services/dialog.service';
import { ITipoFase } from '@core/models/csp/tipos-configuracion';
import { requiredChecked } from '@core/validators/checkbox-validator';

export interface ModeloEjecucionTipoFaseModalData {
  modeloTipoFase: IModeloTipoFase;
  tipoFases: ITipoFase[];
}

@Component({
  templateUrl: './modelo-ejecucion-tipo-fase-modal.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-fase-modal.component.scss']
})
export class ModeloEjecucionTipoFaseModalComponent extends
  BaseModalComponent<IModeloTipoFase, ModeloEjecucionTipoFaseModalComponent> implements OnInit {
  tipoFases$: Observable<ITipoFase[]>;

  constructor(
    protected logger: NGXLogger,
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ModeloEjecucionTipoFaseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModeloEjecucionTipoFaseModalData,
    private tipoFaseService: TipoFaseService,
    protected dialogService: DialogService
  ) {
    super(logger, snackBarService, matDialogRef, data.modeloTipoFase);
    this.logger.debug(ModeloEjecucionTipoFaseModalComponent.name, 'constructor()', 'start');
    this.logger.debug(ModeloEjecucionTipoFaseModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (!this.data.modeloTipoFase.tipoFase) {
      this.tipoFases$ = this.tipoFaseService.findAll().pipe(
        switchMap((result) => {
          const list = this.filterExistingTipoFase(result);
          return of(list);
        })
      );
    } else {
      this.tipoFases$ = this.tipoFaseService.findAll().pipe(
        switchMap((result) => of(result.items))
      );
    }
  }

  /**
   * Comprueba que no hay 2 valores en la lista
   *
   * @param result resultado
   */
  private filterExistingTipoFase(result: SgiRestListResult<ITipoFase>): ITipoFase[] {
    return result.items.filter((tipoFase: ITipoFase) => {
      return this.data.tipoFases.find((currentTipo) => currentTipo.id === tipoFase.id) ? false : true;
    });
  }

  protected getDatosForm(): IModeloTipoFase {
    this.logger.debug(ModeloEjecucionTipoFaseModalComponent.name, `getDatosForm()`, 'start');
    const modeloTipoFase = this.data.modeloTipoFase;
    const disponible = this.formGroup.controls.disponible as FormGroup;
    modeloTipoFase.tipoFase = this.formGroup.get('tipoFase').value;
    modeloTipoFase.convocatoria = disponible.get('convocatoria').value;
    modeloTipoFase.proyecto = disponible.get('proyecto').value;
    modeloTipoFase.solicitud = false;
    this.logger.debug(ModeloEjecucionTipoFaseModalComponent.name, `getDatosForm()`, 'end');
    return modeloTipoFase;
  }

  protected getFormGroup(): FormGroup {
    this.logger.debug(ModeloEjecucionTipoFaseModalComponent.name, `getFormGroup()`, 'start');
    const formGroup = new FormGroup({
      tipoFase: new FormControl({
        value: this.data.modeloTipoFase?.tipoFase,
        disabled: this.data.modeloTipoFase.tipoFase
      }, Validators.required),
      disponible: new FormGroup({
        convocatoria: new FormControl(this.data.modeloTipoFase?.convocatoria),
        proyecto: new FormControl(this.data.modeloTipoFase?.proyecto)
      }, [requiredChecked(1)]),
    });
    this.logger.debug(ModeloEjecucionTipoFaseModalComponent.name, `getFormGroup()`, 'end');
    return formGroup;
  }

  equals(o1: ITipoFase, o2: ITipoFase): boolean {
    return o1?.id === o2?.id;
  }
}
