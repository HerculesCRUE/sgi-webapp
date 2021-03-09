import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IProyectoSocioEquipo } from '@core/models/csp/proyecto-socio-equipo';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { RolProyectoService } from '@core/services/csp/rol-proyecto.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateValidator } from '@core/validators/date-validator';
import { DateUtils } from '@core/utils/date-utils';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { NumberValidator } from '@core/validators/number-validator';
import { IRange } from '@core/validators/range-validator';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const MSG_ERROR_INIT = marker('csp.proyecto.socio-equipo.rol-socio.error.cargar');
const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

export interface ProyectoEquipoSocioModalData {
  proyectoSocioEquipo: IProyectoSocioEquipo;
  selectedProyectoSocioEquipos: IProyectoSocioEquipo[];
  fechaInicioProyectoSocio: Date;
  fechaFinProyectoSocio: Date;
  isEdit: boolean;
}

@Component({
  templateUrl: './proyecto-socio-equipo-modal.component.html',
  styleUrls: ['./proyecto-socio-equipo-modal.component.scss']
})
export class ProyectoSocioEquipoModalComponent extends
  BaseModalComponent<ProyectoEquipoSocioModalData, ProyectoSocioEquipoModalComponent> implements OnInit {
  private rolProyectoFiltered: IRolProyecto[] = [];
  rolProyectos$: Observable<IRolProyecto[]>;
  textSaveOrUpdate: string;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ProyectoSocioEquipoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProyectoEquipoSocioModalData,
    private rolProyectoService: RolProyectoService
  ) {
    super(snackBarService, matDialogRef, data);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.xs = 'row';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadRolProyectos();
    this.textSaveOrUpdate = this.data.isEdit ? MSG_ACEPTAR : MSG_ANADIR;
    this.subscriptions.push(
      merge(
        this.formGroup.get('persona').valueChanges,
        this.formGroup.get('fechaInicio').valueChanges,
        this.formGroup.get('fechaFin').valueChanges
      ).subscribe(() => this.checkRangesDates())
    );
  }

  private loadRolProyectos(): void {
    const subcription = this.rolProyectoService.findAll().pipe(
      map(result => result.items)
    ).subscribe(
      res => {
        this.rolProyectoFiltered = res;
        this.rolProyectos$ = this.formGroup.get('rolProyecto').valueChanges.pipe(
          startWith(''),
          map(value => this.filtroRolProyecto(value))
        );
      },
      error => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT);
      }
    );
    this.subscriptions.push(subcription);
  }

  private filtroRolProyecto(value: string): IRolProyecto[] {
    const filterValue = value.toString().toLowerCase();
    return this.rolProyectoFiltered.filter(
      rolProyecto => rolProyecto.nombre.toLowerCase().includes(filterValue));
  }

  getNombreRolProyecto(rolProyecto?: IRolProyecto): string {
    return typeof rolProyecto === 'string' ? rolProyecto : rolProyecto?.nombre;
  }

  protected getDatosForm(): ProyectoEquipoSocioModalData {
    this.data.proyectoSocioEquipo.rolProyecto = this.formGroup.get('rolProyecto').value;
    this.data.proyectoSocioEquipo.persona = this.formGroup.get('persona').value;
    this.data.proyectoSocioEquipo.fechaFin = this.formGroup.get('fechaFin').value;
    this.data.proyectoSocioEquipo.fechaInicio = this.formGroup.get('fechaInicio').value;
    return this.data;
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup(
      {
        rolProyecto: new FormControl(this.data.proyectoSocioEquipo.rolProyecto, [
          Validators.required,
          IsEntityValidator.isValid()
        ]),
        persona: new FormControl({
          value: this.data.proyectoSocioEquipo.persona,
          disabled: this.data.isEdit
        }, [Validators.required]),
        fechaInicio: new FormControl(this.data.proyectoSocioEquipo.fechaInicio, [
          DateValidator.minDate(this.data.fechaInicioProyectoSocio),
          DateValidator.maxDate(this.data.fechaFinProyectoSocio)
        ]),
        fechaFin: new FormControl(this.data.proyectoSocioEquipo.fechaFin, [
          DateValidator.minDate(this.data.fechaInicioProyectoSocio),
          DateValidator.maxDate(this.data.fechaFinProyectoSocio)
        ]),
      },
      {
        validators: [NumberValidator.isAfterOptional('fechaInicio', 'fechaFin')]
      }
    );
    return formGroup;
  }

  private checkRangesDates(): void {
    const personaForm = this.formGroup.get('persona');
    const fechaInicioForm = this.formGroup.get('fechaInicio');
    const fechaFinForm = this.formGroup.get('fechaFin');

    const fechaInicio = fechaInicioForm.value ? DateUtils.fechaToDate(fechaInicioForm.value).getTime() : Number.MIN_VALUE;
    const fechaFin = fechaFinForm.value ? DateUtils.fechaToDate(fechaFinForm.value).getTime() : Number.MAX_VALUE;
    const ranges = this.data.selectedProyectoSocioEquipos
      .filter(element => element.persona.personaRef === personaForm.value?.personaRef)
      .map(value => {
        const range: IRange = {
          inicio: value.fechaInicio ? DateUtils.fechaToDate(value.fechaInicio).getTime() : Number.MIN_VALUE,
          fin: value.fechaFin ? DateUtils.fechaToDate(value.fechaFin).getTime() : Number.MAX_VALUE,
        };
        return range;
      });

    if (ranges.some(range => (fechaInicio <= range.fin && range.inicio <= fechaFin))) {
      if (fechaInicioForm.value) {
        this.addError(fechaInicioForm, 'range');
      }
      if (fechaFinForm.value) {
        this.addError(fechaFinForm, 'range');
      }
      if (!fechaInicioForm.value && !fechaFinForm.value) {
        this.addError(personaForm, 'contains');
      } else if (personaForm.errors) {
        this.deleteError(personaForm, 'contains');
      }
    } else {
      this.deleteError(fechaInicioForm, 'range');
      this.deleteError(fechaFinForm, 'range');
      this.deleteError(personaForm, 'contains');
    }
  }

  private deleteError(formControl: AbstractControl, errorName: string): void {
    if (formControl.errors) {
      delete formControl.errors[errorName];
      if (Object.keys(formControl.errors).length === 0) {
        formControl.setErrors(null);
      }
    }
  }

  private addError(formControl: AbstractControl, errorName: string): void {
    if (!formControl.errors) {
      formControl.setErrors({});
    }
    formControl.errors[errorName] = true;
    formControl.markAsTouched({ onlySelf: true });
  }
}
