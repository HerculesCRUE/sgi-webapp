import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FormGroupUtil } from '@core/utils/form-group-util';

@Component({
  selector: 'sgi-equipo-investigador-crear-modal',
  templateUrl: './equipo-investigador-crear-modal.component.html',
  styleUrls: ['./equipo-investigador-crear-modal.component.scss']
})
export class EquipoInvestigadorCrearModalComponent implements OnInit {

  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;


  nuevaPersonaEquipo: IPersona;

  constructor(
    public readonly matDialogRef: MatDialogRef<EquipoInvestigadorCrearModalComponent>
  ) { }

  ngOnInit(): void {
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'column';

    this.initFormGroup();
  }

  /**
   * Cierra la ventana modal y devuelve el equipoInvestigador si se ha añadido
   *
   */
  addPersonaEquipoInvestigador(): void {
    const equipoTrabajo: IEquipoTrabajo = {
      id: null,
      peticionEvaluacion: null,
      personaRef: this.nuevaPersonaEquipo?.personaRef,
      nombre: this.nuevaPersonaEquipo?.nombre,
      primerApellido: this.nuevaPersonaEquipo?.primerApellido,
      segundoApellido: this.nuevaPersonaEquipo?.segundoApellido,
      identificadorNumero: this.nuevaPersonaEquipo?.identificadorNumero,
      identificadorLetra: this.nuevaPersonaEquipo?.identificadorLetra,
      nivelAcademico: this.nuevaPersonaEquipo?.nivelAcademico,
      vinculacion: this.nuevaPersonaEquipo?.vinculacion,
      eliminable: true
    };

    this.matDialogRef.close(equipoTrabajo);
  }


  /**
   * Setea el persona seleccionado a través del componente
   * @param persona persona seleccionada
   */
  public onSelectPersona(personaSeleccionada: IPersona): void {
    personaSeleccionada.vinculacion = 'PDI';
    personaSeleccionada.nivelAcademico = 'Licenciado';
    this.nuevaPersonaEquipo = personaSeleccionada;
    this.formGroup.controls.numDocumento.setValue(`${personaSeleccionada.identificadorNumero}${personaSeleccionada.identificadorLetra}`);
    this.formGroup.controls.nombreCompleto.setValue(`${personaSeleccionada.nombre} ${personaSeleccionada.primerApellido} ${personaSeleccionada.segundoApellido}`);
    this.formGroup.controls.vinculacion.setValue(personaSeleccionada.vinculacion);
    this.formGroup.controls.nivelAcademico.setValue(personaSeleccionada.nivelAcademico);
  }

  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.formGroup = new FormGroup({
      numDocumento: new FormControl({ value: '', disabled: true }, [Validators.required]),
      nombreCompleto: new FormControl({ value: '', disabled: true }),
      vinculacion: new FormControl({ value: '', disabled: true }),
      nivelAcademico: new FormControl({ value: '', disabled: true })
    });
  }

}
