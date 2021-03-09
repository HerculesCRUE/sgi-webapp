import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IModeloTipoHito } from '@core/models/csp/modelo-tipo-hito';
import { ITipoHito } from '@core/models/csp/tipos-configuracion';
import { TipoHitoService } from '@core/services/csp/tipo-hito.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { requiredChecked } from '@core/validators/checkbox-validator';
import { SgiRestListResult } from '@sgi/framework/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ModeloEjecucionTipoHitoModalData {
  modeloTipoHito: IModeloTipoHito;
  tipoHitos: ITipoHito[];
}

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-hito-modal',
  templateUrl: './modelo-ejecucion-tipo-hito-modal.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-hito-modal.component.scss']
})
export class ModeloEjecucionTipoHitoModalComponent extends
  BaseModalComponent<IModeloTipoHito, ModeloEjecucionTipoHitoModalComponent> implements OnInit {
  tipoHitos$: Observable<ITipoHito[]>;

  textSaveOrUpdate: string;

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ModeloEjecucionTipoHitoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModeloEjecucionTipoHitoModalData,
    private tipoHitoService: TipoHitoService,
    protected dialogService: DialogService
  ) {
    super(snackBarService, matDialogRef, data.modeloTipoHito);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (!this.data.modeloTipoHito.tipoHito) {
      this.tipoHitos$ = this.tipoHitoService.findTodos().pipe(
        switchMap((result) => {
          const list = this.filterExistingTipoHito(result);
          return of(list);
        })
      );
      this.textSaveOrUpdate = MSG_ANADIR;
    } else {
      this.tipoHitos$ = this.tipoHitoService.findTodos().pipe(
        switchMap((result) => {
          return of(result.items);
        })
      );
      this.textSaveOrUpdate = MSG_ACEPTAR;
    }
  }

  /**
   * Comprueba que no hay 2 valores en la lista
   *
   * @param result resultado
   */
  private filterExistingTipoHito(result: SgiRestListResult<ITipoHito>): ITipoHito[] {
    return result.items.filter((tipoHito: ITipoHito) => {
      return !this.data.tipoHitos.find((currentTipo) => currentTipo.id === tipoHito.id);
    });
  }

  protected getDatosForm(): IModeloTipoHito {
    const modeloTipoHito = this.data.modeloTipoHito;
    const disponible = this.formGroup.controls.disponible as FormGroup;
    modeloTipoHito.tipoHito = this.formGroup.get('tipoHito').value;
    modeloTipoHito.convocatoria = disponible.get('convocatoria').value;
    modeloTipoHito.proyecto = disponible.get('proyecto').value;
    modeloTipoHito.solicitud = disponible.get('solicitud').value;
    return modeloTipoHito;
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      tipoHito: new FormControl({
        value: this.data.modeloTipoHito?.tipoHito,
        disabled: this.data.modeloTipoHito.tipoHito
      }, Validators.required),
      disponible: new FormGroup({
        convocatoria: new FormControl(this.data.modeloTipoHito?.convocatoria),
        proyecto: new FormControl(this.data.modeloTipoHito?.proyecto),
        solicitud: new FormControl(this.data.modeloTipoHito?.solicitud)
      }, [requiredChecked(1)]),
    });
    return formGroup;
  }

  equals(o1: ITipoHito, o2: ITipoHito): boolean {
    return o1?.id === o2?.id;
  }
}
