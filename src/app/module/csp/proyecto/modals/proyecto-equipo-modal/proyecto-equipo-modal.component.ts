import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IProyectoEquipo } from '@core/models/csp/proyecto-equipo';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { RolProyectoService } from '@core/services/csp/rol-proyecto.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { DateValidator } from '@core/validators/date-validator';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { IRange } from '@core/validators/range-validator';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
const MSG_ERROR_INIT = marker('csp.proyecto.equipos.rol.error.cargar');

export interface ProyectoEquiposModalComponentData {
  equipos: IProyectoEquipo[];
  equipo: IProyectoEquipo;
  fechaInicioProyecto: Date;
  fechaFinProyecto: Date;
  isEdit: boolean;
}

@Component({
  selector: 'sgi-proyecto-equipo-modal',
  templateUrl: './proyecto-equipo-modal.component.html',
  styleUrls: ['./proyecto-equipo-modal.component.scss']
})
export class ProyectoEquipoModalComponent extends
  BaseModalComponent<ProyectoEquiposModalComponentData, ProyectoEquipoModalComponent> implements OnInit {

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  formGroup: FormGroup;

  fxFlexProperties: FxFlexProperties;
  fxFlexProperties2: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  textSaveOrUpdate: string;

  private suscripciones: Subscription[] = [];

  private rolProyectoFiltered: IRolProyecto[] = [];
  rolProyectos$: Observable<IRolProyecto[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<ProyectoEquipoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProyectoEquiposModalComponentData,
    private rolProyectoService: RolProyectoService) {

    super(snackBarService, matDialogRef, data);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(15%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexProperties2 = new FxFlexProperties();
    this.fxFlexProperties2.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties2.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadRolEquipo();
    this.textSaveOrUpdate = this.data?.equipo?.id ? MSG_ACEPTAR : MSG_ANADIR;
    this.subscriptions.push(
      merge(
        this.formGroup.get('persona').valueChanges,
        this.formGroup.get('fechaInicio').valueChanges,
        this.formGroup.get('fechaFin').valueChanges
      ).subscribe(() => this.checkRangesDates())
    );
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup(
      {
        rolInv: new FormControl(this.data?.equipo?.rolProyecto, [Validators.required, IsEntityValidator.isValid()]),
        persona: new FormControl({
          value: this.data?.equipo?.persona,
          disabled: this.data.isEdit
        }, [Validators.required]),
        fechaInicio: new FormControl(this.data?.equipo?.fechaInicio),
        fechaFin: new FormControl(this.data?.equipo?.fechaFin),
        horasDedicacion: new FormControl(this.data?.equipo?.horasDedicacion, [Validators.min(0), Validators.max(9999)]),
      },
      {
        validators: [
          ValidarRangoProyecto.rangoProyecto('fechaInicio', 'fechaFin', this.data),
          DateValidator.isAfter('fechaInicio', 'fechaFin', false)
        ]
      }
    );
    return formGroup;
  }

  protected getDatosForm(): ProyectoEquiposModalComponentData {
    this.data.equipo.fechaInicio = this.formGroup.get('fechaInicio').value;
    this.data.equipo.fechaFin = this.formGroup.get('fechaFin').value;
    this.data.equipo.horasDedicacion = this.formGroup.get('horasDedicacion').value;
    this.data.equipo.rolProyecto = this.formGroup.get('rolInv').value;
    this.data.equipo.persona = this.formGroup.get('persona').value;
    return this.data;
  }


  private loadRolEquipo(): void {
    const subcription = this.rolProyectoService.findAll().pipe(
      map(result => result.items)
    ).subscribe(
      res => {
        this.rolProyectoFiltered = res;
        this.rolProyectos$ = this.formGroup.get('rolInv').valueChanges.pipe(
          startWith(''),
          map(value => this.filtroRolEquipo(value))
        );
      },
      error => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT);
      }
    );
    this.suscripciones.push(subcription);
  }

  private filtroRolEquipo(value: string): IRolProyecto[] {
    const filterValue = value.toString().toLowerCase();
    return this.rolProyectoFiltered.filter(
      rolProyecto => rolProyecto.nombre.toLowerCase().includes(filterValue));
  }

  getNombreRolEquipo(rolProyecto?: IRolProyecto): string {
    return typeof rolProyecto === 'string' ? rolProyecto : rolProyecto?.nombre;
  }

  private checkRangesDates(): void {
    const personaForm = this.formGroup.get('persona');
    const fechaInicioForm = this.formGroup.get('fechaInicio');
    const fechaFinForm = this.formGroup.get('fechaFin');

    const fechaInicio = fechaInicioForm.value ? DateUtils.fechaToDate(fechaInicioForm.value).getTime() : Number.MIN_VALUE;
    const fechaFin = fechaFinForm.value ? DateUtils.fechaToDate(fechaFinForm.value).getTime() : Number.MAX_VALUE;
    const ranges = this.data.equipos.filter(
      element => element.persona.personaRef === personaForm.value?.personaRef)
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

export class ValidarRangoProyecto {

  static rangoProyecto(fechaInicioInput: string, fechaFinInput: string, proyecto: ProyectoEquiposModalComponentData): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {

      const fechaInicioForm = formGroup.controls[fechaInicioInput];
      const fechaFinForm = formGroup.controls[fechaFinInput];

      if ((fechaInicioForm.errors && !fechaInicioForm.errors.invalid ||
        fechaFinForm.errors && !fechaFinForm.errors.invalid)) {
        return;
      }

      let fechaInicio;
      let fechaFin;

      if (fechaInicioForm.value) {
        fechaInicio = moment(fechaInicioForm.value).format('YYYY-MM-DD');
      }

      if (fechaFinForm.value) {
        fechaFin = moment(fechaFinForm.value).format('YYYY-MM-DD');
      }

      const fechaProyectoInicio = moment(proyecto.fechaInicioProyecto).format('YYYY-MM-DD');
      const fechaProyectoFin = moment(proyecto.fechaFinProyecto).format('YYYY-MM-DD');

      if (fechaInicio && (fechaInicio < fechaProyectoInicio || fechaInicio > fechaProyectoFin)) {
        fechaInicioForm.setErrors({ invalid: true });
        fechaInicioForm.markAsTouched({ onlySelf: true });
      } else {
        fechaInicioForm.setErrors(null);
      }
      if (fechaFin &&
        (fechaFin < fechaProyectoInicio || fechaFin > fechaProyectoFin)) {

        fechaFinForm.setErrors({ invalid: true });
        fechaFinForm.markAsTouched({ onlySelf: true });
      } else {
        fechaFinForm.setErrors(null);

      }

    };
  }
}
