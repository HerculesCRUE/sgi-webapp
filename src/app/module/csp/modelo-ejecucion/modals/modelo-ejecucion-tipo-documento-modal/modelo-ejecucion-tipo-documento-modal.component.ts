import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IModeloTipoDocumento } from '@core/models/csp/modelo-tipo-documento';
import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { ITipoDocumento, ITipoFase } from '@core/models/csp/tipos-configuracion';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { TipoDocumentoService } from '@core/services/csp/tipo-documento.service';
import { TipoFaseService } from '@core/services/csp/tipo-fase.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export interface ModeloTipoDocumentoModalData {
  modeloTipoDocumento: IModeloTipoDocumento;
  tipoDocumentos: ITipoDocumento[];
  tipoFases: ITipoFase[];
  id: number;
}

@Component({
  selector: 'sgi-modelo-ejecucion-tipo-documento-modal',
  templateUrl: './modelo-ejecucion-tipo-documento-modal.component.html',
  styleUrls: ['./modelo-ejecucion-tipo-documento-modal.component.scss']
})
export class ModeloEjecucionTipoDocumentoModalComponent extends
  BaseModalComponent<IModeloTipoDocumento, ModeloEjecucionTipoDocumentoModalComponent> implements OnInit {
  tipoDocumentos$: Observable<ITipoDocumento[]>;

  constructor(
    protected logger: NGXLogger,
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ModeloEjecucionTipoDocumentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModeloTipoDocumentoModalData,
    private tipoDocumentoService: TipoDocumentoService,
    private modeloEjecucionService: ModeloEjecucionService
  ) {
    super(logger, snackBarService, matDialogRef, data.modeloTipoDocumento);
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, 'constructor()', 'start');
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `ngOnInit()`, 'start');
    super.ngOnInit();
    this.loadTipoDocumentos();
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `ngOnInit()`, 'end');
  }

  private loadTipoDocumentos(): void {
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `loadTipoDocumentos()`, 'start');
    if (this.data.id) {
      this.tipoDocumentos$ = this.getUpdateTipoDocumentos();
    } else {
      this.tipoDocumentos$ = this.getNewTipoDocumentos();
    }
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `loadTipoDocumentos()`, 'end');
  }

  private getNewTipoDocumentos(): Observable<ITipoDocumento[]> {
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getNewTipoDocumentos()`, 'start');
    return this.tipoDocumentoService.findAll().pipe(
      switchMap(
        (result) =>
          of(this.filterExistingTipoDocumentos(result.items, this.data.tipoDocumentos))
      ),
      tap(() => this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getNewTipoDocumentos()`, 'end'))
    );
  }

  private getUpdateTipoDocumentos(): Observable<ITipoDocumento[]> {
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getUpdateTipoDocumentos()`, 'start');
    let tiposDocumento = [] as ITipoDocumento[];
    return this.tipoDocumentoService.findAll().pipe(
      switchMap(
        (result) => {
          tiposDocumento = this.filterExistingTipoDocumentos(result.items, this.data.tipoDocumentos);
          return this.modeloEjecucionService.findModeloTipoDocumento(this.data.id).pipe(
            map((listResult: SgiRestListResult<IModeloTipoDocumento>) => {
              return listResult.items.filter(modelo => !modelo.activo || modelo.activo && modelo.modeloTipoFase);
            })
          );
        }
      ),
      switchMap((modelosTipoDocumento: IModeloTipoDocumento[]) => {
        let filteredTipoDocumento = modelosTipoDocumento.map(modelo => modelo.tipoDocumento);
        filteredTipoDocumento = this.filterExistingTipoDocumentos(filteredTipoDocumento, this.data.tipoDocumentos);
        filteredTipoDocumento = this.filterExistingTipoDocumentos(filteredTipoDocumento, tiposDocumento);
        return of(filteredTipoDocumento.concat(tiposDocumento).sort(
          (a, b) => {
            if (a.nombre > b.nombre) {
              return 1;
            }
            if (a.nombre < b.nombre) {
              return -1;
            }
            return 0;
          })
        );
      }),
      tap(() => this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getUpdateTipoDocumentos()`, 'end'))
    );
  }

  private filterExistingTipoDocumentos(result: ITipoDocumento[], filters: ITipoDocumento[]): ITipoDocumento[] {
    return result.filter((tipoEnlace) => {
      return !filters.find((currentTipo) => currentTipo.id === tipoEnlace.id);
    });
  }

  protected getFormGroup(): FormGroup {
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getFormGroup()`, 'start');
    const formGroup = new FormGroup({
      tipoDocumento: new FormControl(this.data.modeloTipoDocumento?.tipoDocumento),
      tipoFase: new FormControl(this.data.modeloTipoDocumento?.modeloTipoFase)
    });
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getFormGroup()`, 'end');
    return formGroup;
  }

  protected getDatosForm(): IModeloTipoDocumento {
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getDatosForm()`, 'start');
    const modeloTipoDocumento = this.data.modeloTipoDocumento;
    modeloTipoDocumento.tipoDocumento = this.formGroup.get('tipoDocumento').value;
    modeloTipoDocumento.modeloTipoFase = {
      tipoFase: this.formGroup.get('tipoFase').value
    } as IModeloTipoFase;
    this.logger.debug(ModeloEjecucionTipoDocumentoModalComponent.name, `getDatosForm}()`, 'end');
    return modeloTipoDocumento;
  }
}
