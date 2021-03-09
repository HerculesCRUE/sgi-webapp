import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IRolSocio } from '@core/models/csp/rol-socio';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { RolSocioService } from '@core/services/csp/rol-socio.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IRange } from '@core/validators/range-validator';
import { NGXLogger } from 'ngx-logger';
import { merge, Observable, Subscription } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { SolicitudProyectoSocioActionService } from '../../solicitud-proyecto-socio.action.service';
import { SolicitudProyectoSocioDatosGeneralesFragment } from './solicitud-proyecto-socio-datos-generales.fragment';


const MSG_ERROR_INIT = marker('csp.solicitud-proyecto-socio.rol.error.cargar');

@Component({
  selector: 'sgi-solicitud-proyecto-socio-datos-generales',
  templateUrl: './solicitud-proyecto-socio-datos-generales.component.html',
  styleUrls: ['./solicitud-proyecto-socio-datos-generales.component.scss']
})
export class SolicitudProyectoSocioDatosGeneralesComponent extends FormFragmentComponent<ISolicitudProyectoSocio>
  implements OnInit, OnDestroy {
  formPart: SolicitudProyectoSocioDatosGeneralesFragment;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  private subscriptions: Subscription[] = [];
  private rolSocioFiltered: IRolSocio[] = [];
  rolSocios$: Observable<IRolSocio[]>;

  constructor(
    private readonly logger: NGXLogger,
    protected actionService: SolicitudProyectoSocioActionService,
    private snackBarService: SnackBarService,
    private rolSocioService: RolSocioService,
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formPart = this.fragment as SolicitudProyectoSocioDatosGeneralesFragment;
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(36%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadRolProyectos();
    this.subscriptions.push(
      merge(
        this.formGroup.get('empresa').valueChanges,
        this.formGroup.get('mesInicio').valueChanges,
        this.formGroup.get('mesFin').valueChanges
      ).pipe(
        tap(() => this.checkRangesMeses())
      ).subscribe()
    );
  }

  private loadRolProyectos(): void {
    const subcription = this.rolSocioService.findAll().pipe(
      map(result => result.items)
    ).subscribe(
      res => {
        this.rolSocioFiltered = res;
        this.rolSocios$ = this.formGroup.get('rolSocio').valueChanges.pipe(
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

  private filtroRolProyecto(value: string): IRolSocio[] {
    const filterValue = value.toString().toLowerCase();
    return this.rolSocioFiltered.filter(
      rolSocio => rolSocio.nombre.toLowerCase().includes(filterValue));
  }

  getNombreRolSocio(rolProyecto?: IRolSocio): string {
    return typeof rolProyecto === 'string' ? rolProyecto : rolProyecto?.nombre;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private checkRangesMeses(): void {
    const empresaForm = this.formGroup.get('empresa');
    const mesInicioForm = this.formGroup.get('mesInicio');
    const mesFinForm = this.formGroup.get('mesFin');

    const mesInicio = mesInicioForm.value ? mesInicioForm.value : Number.MIN_VALUE;
    const mesFin = mesFinForm.value ? mesFinForm.value : Number.MAX_VALUE;
    const ranges = this.actionService.getSelectedSolicitudProyectoSocios().filter(
      element => element.empresa.personaRef === empresaForm.value?.personaRef
        && element.id !== this.formPart.solicitudProyectoSocio.id)
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
        this.addError(empresaForm, 'contains');
      } else if (empresaForm.errors) {
        this.deleteError(empresaForm, 'contains');
      }
    } else {
      this.deleteError(mesInicioForm, 'range');
      this.deleteError(mesFinForm, 'range');
      this.deleteError(empresaForm, 'contains');
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
