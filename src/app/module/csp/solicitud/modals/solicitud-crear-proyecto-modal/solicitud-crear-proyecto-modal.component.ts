import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IProyecto } from '@core/models/csp/proyecto';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { DateValidator } from '@core/validators/date-validator';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const MSG_ACEPTAR = marker('botones.aceptar');
const MSG_ERROR_INIT = marker('csp.solicitud.crear.proyecto.error.cargar');

export interface ISolicitudCrearProyectoModalData {
  proyecto: IProyecto;
  solicitudProyectoDatos: ISolicitudProyectoDatos;
}

@Component({
  templateUrl: './solicitud-crear-proyecto-modal.component.html',
  styleUrls: ['./solicitud-crear-proyecto-modal.component.scss']
})
export class SolicitudCrearProyectoModalComponent extends
  BaseModalComponent<IProyecto, SolicitudCrearProyectoModalComponent> implements OnInit {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  textSaveOrUpdate: string;

  private modelosEjecucionFiltered = [] as IModeloEjecucion[];
  modelosEjecucion$: Observable<IModeloEjecucion[]>;

  constructor(
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<SolicitudCrearProyectoModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public solicitudCrearProyectoModalData: ISolicitudCrearProyectoModalData,
    private unidadModeloService: ModeloUnidadService,
    private logger: NGXLogger
  ) {
    super(snackBarService, matDialogRef, solicitudCrearProyectoModalData.proyecto);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.textSaveOrUpdate = MSG_ACEPTAR;
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup(
      {
        fechaInicio: new FormControl('', [Validators.required]),
        fechaFin: new FormControl('', [Validators.required]),
        modeloEjecucion: new FormControl(this.solicitudCrearProyectoModalData?.proyecto?.solicitud?.convocatoria?.modeloEjecucion, [Validators.required])
      },
      {
        validators: [
          DateValidator.isAfter('fechaInicio', 'fechaFin'),
          DateValidator.isBefore('fechaFin', 'fechaInicio')
        ]
      }
    );

    this.subscriptions.push(
      formGroup.controls.fechaInicio.valueChanges.subscribe((value) => {
        this.getFechaFinProyecto(value);
      })
    );

    if (this.solicitudCrearProyectoModalData?.proyecto?.solicitud?.convocatoria?.modeloEjecucion) {
      formGroup.controls.modeloEjecucion.disable();
    }

    return formGroup;
  }

  protected getDatosForm(): IProyecto {
    return {
      fechaInicio: this.formGroup.controls.fechaInicio.value,
      fechaFin: this.formGroup.controls.fechaFin.value,
      modeloEjecucion: this.formGroup.controls.modeloEjecucion.value
    } as IProyecto
  }

  /**
   * Devuelve el nombre de un modelo de ejecución.
   * @param modeloEjecucion modelo de ejecución.
   * @returns nombre de un modelo de ejecución.
   */
  getModeloEjecucion(modeloEjecucion?: IModeloEjecucion): string | undefined {
    return typeof modeloEjecucion === 'string' ? modeloEjecucion : modeloEjecucion?.nombre;
  }

  loadModelosEjecucion(): void {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('unidadGestionRef', SgiRestFilterOperator.EQUALS, this.solicitudCrearProyectoModalData?.proyecto?.solicitud?.unidadGestion?.acronimo)
    };
    const subcription = this.unidadModeloService.findAll(options).subscribe(
      res => {
        this.modelosEjecucionFiltered = res.items.map(item => item.modeloEjecucion);
        this.modelosEjecucion$ = this.formGroup.controls.modeloEjecucion.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filtroModeloEjecucion(value))
          );
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT);
      }
    );
    this.subscriptions.push(subcription);
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroModeloEjecucion(value: string): IModeloEjecucion[] {
    const filterValue = value.toString().toLowerCase();
    return this.modelosEjecucionFiltered.filter(modeloEjecucion => modeloEjecucion.nombre.toLowerCase().includes(filterValue));
  }

  private getFechaFinProyecto(fecha: string): void {
    const fechaInicio = fecha ? DateUtils.fechaToDate(fecha) : null;
    let fechaFin = fechaInicio;
    if (fechaInicio && this.solicitudCrearProyectoModalData?.solicitudProyectoDatos?.duracion) {
      fechaFin.setMonth(fechaInicio.getMonth() + this.solicitudCrearProyectoModalData?.solicitudProyectoDatos?.duracion);
      this.formGroup.controls.fechaFin.setValue(DateUtils.formatFechaAsISODate(fechaFin));
    }
  }

}
