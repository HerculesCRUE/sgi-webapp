import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { ISolicitudProyectoEquipo } from '@core/models/csp/solicitud-proyecto-equipo';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { RolProyectoService } from '@core/services/csp/rol-proyecto.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { NumberValidator } from '@core/validators/number-validator';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { IRange } from '@core/validators/range-validator';

const MSG_ERROR_INIT = marker('csp.solicitud.equipo.proyecto.rol.error.cargar');
const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');

export interface EquipoProyectoModalData {
  solicitudProyectoEquipo: ISolicitudProyectoEquipo;
  selectedProyectoEquipos: ISolicitudProyectoEquipo[];
  isEdit: boolean;
  readonly: boolean;
}

@Component({
  templateUrl: './solicitud-equipo-proyecto-modal.component.html',
  styleUrls: ['./solicitud-equipo-proyecto-modal.component.scss']
})
export class SolicitudEquipoProyectoModalComponent extends
  BaseModalComponent<EquipoProyectoModalData, SolicitudEquipoProyectoModalComponent> implements OnInit {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  textSaveOrUpdate: string;

  private rolProyectoFiltered: IRolProyecto[] = [];
  rolProyectos$: Observable<IRolProyecto[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    public matDialogRef: MatDialogRef<SolicitudEquipoProyectoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EquipoProyectoModalData,
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
    this.textSaveOrUpdate = this.data.solicitudProyectoEquipo?.id ? MSG_ACEPTAR : MSG_ANADIR;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadRolProyectos();
    this.subscriptions.push(
      merge(
        this.formGroup.get('persona').valueChanges,
        this.formGroup.get('mesInicio').valueChanges,
        this.formGroup.get('mesFin').valueChanges
      ).subscribe(() => {
        this.checkRangesMeses();
      })
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

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup(
      {
        rolProyecto: new FormControl(this.data.solicitudProyectoEquipo.rolProyecto, [
          Validators.required,
          IsEntityValidator.isValid()
        ]),
        persona: new FormControl({
          value: this.data.solicitudProyectoEquipo.persona,
          disabled: this.data.isEdit
        }, [Validators.required]),
        mesInicio: new FormControl(this.data.solicitudProyectoEquipo.mesInicio, [Validators.min(1), Validators.max(9999)]),
        mesFin: new FormControl(this.data.solicitudProyectoEquipo.mesFin, [Validators.min(1), Validators.max(9999)]),
      },
      {
        validators: [
          NumberValidator.isAfterOptional('mesInicio', 'mesFin'),
        ]
      }
    );

    if (this.data.readonly) {
      formGroup.disable();
    }

    return formGroup;
  }

  protected getDatosForm(): EquipoProyectoModalData {
    this.data.solicitudProyectoEquipo.rolProyecto = this.formGroup.get('rolProyecto').value;
    this.data.solicitudProyectoEquipo.persona = this.formGroup.get('persona').value;
    this.data.solicitudProyectoEquipo.mesInicio = this.formGroup.get('mesInicio').value;
    this.data.solicitudProyectoEquipo.mesFin = this.formGroup.get('mesFin').value;
    return this.data;
  }

  private checkRangesMeses(): void {
    const personaForm = this.formGroup.get('persona');
    const mesInicioForm = this.formGroup.get('mesInicio');
    const mesFinForm = this.formGroup.get('mesFin');

    const mesInicio = mesInicioForm.value ? mesInicioForm.value : Number.MIN_VALUE;
    const mesFin = mesFinForm.value ? mesFinForm.value : Number.MAX_VALUE;
    const ranges = this.data.selectedProyectoEquipos
      .filter(element => element.persona.personaRef === personaForm.value?.personaRef)
      .map(solicitudProyectoSocio => {
        const range: IRange = {
          inicio: solicitudProyectoSocio.mesInicio ? solicitudProyectoSocio.mesInicio : Number.MIN_VALUE,
          fin: solicitudProyectoSocio.mesFin ? solicitudProyectoSocio.mesFin : Number.MAX_VALUE
        };
        return range;
      });

    if (ranges.some(range => (mesInicio <= range.fin && range.inicio <= mesFin))) {
      if (mesInicioForm.value) {
        this.addError(mesInicioForm, 'range');
      }
      if (mesFinForm.value) {
        this.addError(mesFinForm, 'range');
      }
      if (!mesInicioForm.value && !mesFinForm.value) {
        this.addError(personaForm, 'contains');
      } else if (personaForm.errors) {
        this.deleteError(personaForm, 'contains');
      }
    } else {
      this.deleteError(mesInicioForm, 'range');
      this.deleteError(mesFinForm, 'range');
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
