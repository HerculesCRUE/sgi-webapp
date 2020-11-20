import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import { NGXLogger } from 'ngx-logger';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { IConfiguracion } from '@core/models/eti/configuracion';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ConfiguracionService } from '@core/services/eti/configuracion.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SnackBarService } from '@core/services/snack-bar.service';

const MSG_SUCCESS = marker('eti.configuracion.formulario.acualizar.correcto');
const MSG_ERROR = marker('eti.configuracion.formulario.acualizar.error');

@Component({
  selector: 'sgi-configuracion-formulario',
  templateUrl: './configuracion-formulario.component.html',
  styleUrls: ['./configuracion-formulario.component.scss']
})
export class ConfiguracionFormularioComponent implements OnInit, OnDestroy {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  formGroup: FormGroup;

  private suscripciones: Subscription[] = [];
  private configuracion: IConfiguracion;

  private initialFormValue: IConfiguracion;

  updateEnable = false;

  constructor(
    protected readonly logger: NGXLogger,
    private service: ConfiguracionService,
    private snackBarService: SnackBarService
  ) {

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-50px)';
    this.fxFlexProperties.md = '0 1 calc(50%-50px)';
    this.fxFlexProperties.gtMd = '0 1 calc(50%-50px)';
    this.fxFlexProperties.order = '1';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '50px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit() {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'ngOnInit()', 'start');
    this.initFormGroup();
    this.loadConfiguracion();
    this.logger.debug(ConfiguracionFormularioComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'initFormGroup()', 'start');
    this.formGroup = new FormGroup({
      mesesArchivadaInactivo: new FormControl('', [Validators.required]),
      diasArchivadaPendienteCorrecciones: new FormControl('', [Validators.required]),
      diasLimiteEvaluador: new FormControl('', [Validators.required]),
      mesesAvisoProyectoCEEA: new FormControl('', [Validators.required]),
      mesesAvisoProyectoCEISH: new FormControl('', [Validators.required]),
      mesesAvisoProyectoCEIAB: new FormControl('', [Validators.required])
    });
    const formChangesSubscription = this.formGroup.statusChanges.subscribe(status => this.hasChanges(status));
    this.suscripciones.push(formChangesSubscription);
    this.logger.debug(ConfiguracionFormularioComponent.name, 'initFormGroup()', 'end');
  }

  private setForm(configuracion: IConfiguracion) {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'setForm(configuracion: IConfiguracion)', 'start');
    this.configuracion = configuracion;
    this.formGroup.controls.mesesArchivadaInactivo.setValue(configuracion.mesesArchivadaInactivo);
    this.formGroup.controls.diasArchivadaPendienteCorrecciones.setValue(configuracion.diasArchivadaPendienteCorrecciones);
    this.formGroup.controls.diasLimiteEvaluador.setValue(configuracion.diasLimiteEvaluador);
    this.formGroup.controls.mesesAvisoProyectoCEEA.setValue(configuracion.mesesAvisoProyectoCEEA);
    this.formGroup.controls.mesesAvisoProyectoCEISH.setValue(configuracion.mesesAvisoProyectoCEISH);
    this.formGroup.controls.mesesAvisoProyectoCEIAB.setValue(configuracion.mesesAvisoProyectoCEIAB);
    this.initialFormValue = Object.assign({}, this.formGroup.value);
    this.logger.debug(ConfiguracionFormularioComponent.name, 'setForm(configuracion: IConfiguracion)', 'end');
  }

  private getForm(): IConfiguracion {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'setForm(configuracion: IConfiguracion)', 'start');
    this.configuracion.mesesArchivadaInactivo = this.formGroup.value.mesesArchivadaInactivo;
    this.configuracion.diasArchivadaPendienteCorrecciones = this.formGroup.value.diasArchivadaPendienteCorrecciones;
    this.configuracion.diasLimiteEvaluador = this.formGroup.value.diasLimiteEvaluador;
    this.configuracion.mesesAvisoProyectoCEEA = this.formGroup.value.mesesAvisoProyectoCEEA;
    this.configuracion.mesesAvisoProyectoCEISH = this.formGroup.value.mesesAvisoProyectoCEISH;
    this.configuracion.mesesAvisoProyectoCEIAB = this.formGroup.value.mesesAvisoProyectoCEIAB;
    this.logger.debug(ConfiguracionFormularioComponent.name, 'setForm(configuracion: IConfiguracion)', 'end');
    return this.configuracion;
  }

  private loadConfiguracion() {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'loadConfiguracion()', 'start');
    const configuracionFindSubscription = this.service.getConfiguracion().subscribe(
      configuracion => {
        this.setForm(configuracion);
        this.logger.debug(ConfiguracionFormularioComponent.name, 'loadConfiguracion()', 'end');
      });
    this.suscripciones.push(configuracionFindSubscription);
  }

  update() {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'update()', 'start');
    const configuracionUpdateSubscription = this.service.update(this.configuracion.id, this.getForm()).subscribe(
      (value) => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.configuracion = value;
        this.updateEnable = false;
        this.logger.debug(ConfiguracionFormularioComponent.name, 'update()', 'end');
      },
      () => {
        this.snackBarService.showError(MSG_ERROR);
        this.logger.error(ConfiguracionFormularioComponent.name, 'update()', 'error');
      }
    );
    this.suscripciones.push(configuracionUpdateSubscription);
    this.logger.debug(ConfiguracionFormularioComponent.name, 'update()', 'end');
  }

  cancel() {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'cancel()', 'start');
    this.setForm(this.configuracion);
    this.updateEnable = false;
    this.logger.debug(ConfiguracionFormularioComponent.name, 'cancel()', 'end');
  }

  private hasChanges(status: string) {
    if (status === 'VALID' && this.initialFormValue) {
      this.updateEnable = (!this.isEquals(this.initialFormValue, this.formGroup.value));
    }
  }

  private isEquals(initFormValue: IConfiguracion, formValue: IConfiguracion): boolean {
    if (initFormValue && formValue) {
      if (initFormValue.mesesArchivadaInactivo === formValue.mesesArchivadaInactivo
        && initFormValue.mesesAvisoProyectoCEEA === formValue.mesesAvisoProyectoCEEA
        && initFormValue.mesesAvisoProyectoCEISH === formValue.mesesAvisoProyectoCEISH
        && initFormValue.mesesAvisoProyectoCEIAB === formValue.mesesAvisoProyectoCEIAB
        && initFormValue.diasArchivadaPendienteCorrecciones === formValue.diasArchivadaPendienteCorrecciones
        && initFormValue.diasLimiteEvaluador === formValue.diasLimiteEvaluador) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    this.logger.debug(ConfiguracionFormularioComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones?.forEach(x => x.unsubscribe());
    this.logger.debug(ConfiguracionFormularioComponent.name, 'ngOnDestroy()', 'end');
  }

}
