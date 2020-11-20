import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { FormacionEspecifica } from '@core/models/eti/formacion-especifica';
import { IMemoria } from '@core/models/eti/memoria';
import { ITarea } from '@core/models/eti/tarea';
import { IPersona } from '@core/models/sgp/persona';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { EquipoTrabajoService } from '@core/services/eti/equipo-trabajo.service';
import { FormacionEspecificaService } from '@core/services/eti/formacion-especifica.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { TareaService } from '@core/services/eti/tarea.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IConflictoInteres } from '@core/models/eti/conflicto-interes';
import { IEvaluador } from '@core/models/eti/evaluador';

const MSG_SUCCESS = marker('eti.acta.asistentes.correcto');
const MSG_ERROR = marker('eti.acta.asistentes.error');
const MSG_ERROR_FORM = marker('form-group.error');
const MSG_ERROR_CONFLICTO_REPETIDO = marker('eti.evaluador.conflictoInteres.formulario.listado.personaConflicto.repetida');

@Component({
  selector: 'sgi-evaluador-conflictos-interes-modal',
  templateUrl: './evaluador-conflictos-interes-modal.component.html',
  styleUrls: ['./evaluador-conflictos-interes-modal.component.scss']
})
export class EvaluadorConflictosInteresModalComponent implements OnInit, OnDestroy {

  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;

  conflictoInteresSuscripcion: Subscription;

  nuevaPersonaConflicto: IPersona;


  constructor(
    private readonly logger: NGXLogger,
    @Inject(MAT_DIALOG_DATA) public conflictos: IConflictoInteres[],
    public readonly matDialogRef: MatDialogRef<EvaluadorConflictosInteresModalComponent>,
    private readonly snackBarService: SnackBarService) {
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'ngOnInit()', 'start');
    this.initFormGroup();
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'ngOnInit()', 'end');

  }
  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'initFormGroup()', 'start');
    this.formGroup = new FormGroup({
      identificador: new FormControl({ value: '', disabled: true }, [Validators.required])
    });

    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'initFormGroup()', 'end');
  }

  /**
   * Cierra la ventana modal y devuelve el conflicto de interés si se ha modificado
   *
   * @param conflictoInteres conflicto interés modificado
   */
  closeModal(conflictoInteres?: IConflictoInteres): void {
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'closeModal()', 'start');
    if (conflictoInteres) {
      const isRepetido =
        this.conflictos.some(conflictoListado =>
          conflictoInteres.personaConflictoRef === conflictoListado.personaConflictoRef);

      if (isRepetido) {
        this.snackBarService.showError(MSG_ERROR_CONFLICTO_REPETIDO);
        this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'openModalAddTarea() - end');
        return;
      }
    }
    this.matDialogRef.close(conflictoInteres);
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'closeModal()', 'end');
  }

  /**
   * Comprueba el formulario y envia el conflicto de interés resultante
   */
  addConflicto() {
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'editTarea()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM);
    }
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'editTarea()', 'end');
  }

  /**
   * Setea el persona seleccionado a través del componente
   * @param persona persona seleccionada
   */
  public onSelectPersona(personaSeleccionada: IPersona): void {
    this.nuevaPersonaConflicto = personaSeleccionada;
    this.formGroup.controls.identificador.setValue(`${personaSeleccionada.identificadorNumero}${personaSeleccionada.identificadorLetra}`);
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private getDatosForm(): IConflictoInteres {
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'getDatosForm()', 'start');
    const evaluadorObj: IEvaluador = {
      activo: null,
      cargoComite: null,
      comite: null,
      fechaAlta: null,
      fechaBaja: null,
      id: null,
      identificadorLetra: null,
      identificadorNumero: null,
      nivelAcademico: null,
      nombre: null,
      personaRef: null,
      primerApellido: null,
      resumen: null,
      segundoApellido: null,
      vinculacion: null
    };
    const conflictoInteres: IConflictoInteres = {
      evaluador: evaluadorObj,
      id: null,
      personaConflictoRef: this.nuevaPersonaConflicto?.personaRef,
      personaRef: this.nuevaPersonaConflicto?.personaRef,
      nombre: this.nuevaPersonaConflicto?.nombre,
      primerApellido: this.nuevaPersonaConflicto?.primerApellido,
      segundoApellido: this.nuevaPersonaConflicto?.segundoApellido,
      identificadorNumero: this.nuevaPersonaConflicto?.identificadorNumero,
      identificadorLetra: this.nuevaPersonaConflicto?.identificadorLetra,
      nivelAcademico: this.nuevaPersonaConflicto?.nivelAcademico,
      vinculacion: this.nuevaPersonaConflicto?.vinculacion
    };
    return conflictoInteres;
  }

  ngOnDestroy(): void {
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'ngOnDestroy()', 'start');
    this.conflictoInteresSuscripcion?.unsubscribe();
    this.logger.debug(EvaluadorConflictosInteresModalComponent.name, 'ngOnDestroy()', 'end');
  }

}
