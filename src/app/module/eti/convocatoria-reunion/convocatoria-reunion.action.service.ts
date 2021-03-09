import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { ActionService } from '@core/services/action-service';
import { AsistenteService } from '@core/services/eti/asistente.service';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { ConvocatoriaReunionAsignacionMemoriasListadoFragment } from './convocatoria-reunion-formulario/convocatoria-reunion-asignacion-memorias/convocatoria-reunion-asignacion-memorias-listado/convocatoria-reunion-asignacion-memorias-listado.fragment';
import { ConvocatoriaReunionDatosGeneralesFragment } from './convocatoria-reunion-formulario/convocatoria-reunion-datos-generales/convocatoria-reunion-datos-generales.fragment';

interface DatosAsignacionEvaluacion {
  idComite: number;
  idTipoConvocatoria: number;
  fechaLimite: Date;
}

@Injectable()
export class ConvocatoriaReunionActionService extends ActionService {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    ASIGNACION_MEMORIAS: 'asignacionMemorias'
  };

  convocatoriaReunion: IConvocatoriaReunion;
  private datosGenerales: ConvocatoriaReunionDatosGeneralesFragment;
  private asignacionMemorias: ConvocatoriaReunionAsignacionMemoriasListadoFragment;

  public disableAsignarMemorias: Subject<boolean> = new Subject<boolean>();
  public disableCamposDatosGenerales: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly logger: NGXLogger,
    fb: FormBuilder,
    route: ActivatedRoute,
    service: ConvocatoriaReunionService,
    asistenteService: AsistenteService,
    evaluacionService: EvaluacionService,
    personaFisicaService: PersonaFisicaService,
    evaluadorService: EvaluadorService
  ) {
    super();
    this.convocatoriaReunion = {} as IConvocatoriaReunion;
    if (route.snapshot.data.convocatoriaReunion) {
      this.convocatoriaReunion = route.snapshot.data.convocatoriaReunion;
      this.enableEdit();
    }
    this.datosGenerales = new ConvocatoriaReunionDatosGeneralesFragment(
      logger,
      fb, this.convocatoriaReunion?.id,
      service, asistenteService, personaFisicaService, evaluadorService);
    this.asignacionMemorias = new ConvocatoriaReunionAsignacionMemoriasListadoFragment(
      logger,
      this.convocatoriaReunion?.id,
      evaluacionService, personaFisicaService, service);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.ASIGNACION_MEMORIAS, this.asignacionMemorias);
  }

  public getDatosAsignacion(): DatosAsignacionEvaluacion {
    const datosAsignacionEvaluacion = {
      idComite: this.datosGenerales.getFormGroup().controls.comite.value?.id,
      idTipoConvocatoria: this.datosGenerales.getFormGroup().controls.tipoConvocatoriaReunion.value?.id,
      fechaLimite: this.datosGenerales.getFormGroup().controls.fechaLimite.value
    } as DatosAsignacionEvaluacion;
    return datosAsignacionEvaluacion;
  }

  onKeyChange(value: number) {
    this.asignacionMemorias.setKey(value);
    this.asignacionMemorias.setConvocatoriaReunion(this.datosGenerales.getValue());
  }

  /**
   * Actualiza el valor de disableCamposDatosGenerales utilizado para evitar que se
   * modifiquen los datos del comité, del tipo de convocatoria y de la fecha límite
   * de la convocatoria cuando ya tiene memorias asignadas.
   *
   * Si la convocatoria tiene Acta los campos ya estarán desactivados
   *
   * Los disable/enable se asignan desde aquí porque no se recomienda hacerlo en la plantilla.
   *
   */
  onEnterDatosGenerales(): void {
    // Si la convocatoria tiene Acta los campos ya estarán desactivados
    if (this.datosGenerales.hasActa()) {
      return;
    }

    let disable = true;
    this.datosGenerales.getFormGroup().controls.comite.disable({ onlySelf: true });
    this.datosGenerales.getFormGroup().controls.fechaLimite.disable({ onlySelf: true });
    this.datosGenerales.getFormGroup().controls.tipoConvocatoriaReunion.disable({ onlySelf: true });

    if (this.asignacionMemorias.evaluaciones$.value.length === 0) {
      disable = false;
      this.datosGenerales.getFormGroup().controls.comite.enable({ onlySelf: true });
      this.datosGenerales.getFormGroup().controls.fechaLimite.enable({ onlySelf: true });
      this.datosGenerales.getFormGroup().controls.tipoConvocatoriaReunion.enable({ onlySelf: true });
    }

    this.disableCamposDatosGenerales.next(disable);
  }

  /**
   * Actualiza el valor de disableAsignarMemorias utilizado para evitar que se
   * asignen memorias a la convocatoria cuando aún no se han asignado valores
   * al comité, al tipo de convocatoria y ni a la fecha límite, ya que esos datos
   * son necesarios para determinar las memorias que podrán ser asignadas a la
   * convocatoria.
   *
   * Si la convocatoria tiene Acta siempre tendrá valor en los campos requeridos
   */
  onEnterAsignacionMemorias(): void {
    // Si la convocatoria tiene Acta siempre tendrá valor en los campos requeridos
    if (this.datosGenerales.hasActa()) {
      return;
    }

    let disable = true;
    if (this.datosGenerales.getFormGroup().controls.comite.value &&
      this.datosGenerales.getFormGroup().controls.tipoConvocatoriaReunion.value &&
      this.datosGenerales.getFormGroup().controls.fechaLimite.value) {
      disable = false;
    }

    this.disableAsignarMemorias.next(disable);
  }
}
