import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConflictoInteres } from '@core/models/eti/conflicto-interes';
import { IEvaluador } from '@core/models/eti/evaluador';
import { IPersona } from '@core/models/sgp/persona';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { Subscription } from 'rxjs';

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
    @Inject(MAT_DIALOG_DATA) public conflictos: IConflictoInteres[],
    public readonly matDialogRef: MatDialogRef<EvaluadorConflictosInteresModalComponent>,
    private readonly snackBarService: SnackBarService) {
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
  }

  ngOnInit(): void {
    this.initFormGroup();
  }
  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.formGroup = new FormGroup({
      identificador: new FormControl({ value: '', disabled: true }, [Validators.required])
    });
  }

  /**
   * Cierra la ventana modal y devuelve el conflicto de interés si se ha modificado
   *
   * @param conflictoInteres conflicto interés modificado
   */
  closeModal(conflictoInteres?: IConflictoInteres): void {
    if (conflictoInteres) {
      const isRepetido =
        this.conflictos.some(conflictoListado =>
          conflictoInteres.personaConflictoRef === conflictoListado.personaConflictoRef);

      if (isRepetido) {
        this.snackBarService.showError(MSG_ERROR_CONFLICTO_REPETIDO);
        return;
      }
    }
    this.matDialogRef.close(conflictoInteres);
  }

  /**
   * Comprueba el formulario y envia el conflicto de interés resultante
   */
  addConflicto() {
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM);
    }
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
    this.conflictoInteresSuscripcion?.unsubscribe();
  }

}
