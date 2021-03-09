import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DateUtils } from '@core/utils/date-utils';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProyectoPeriodoSeguimientoActionService } from '../../proyecto-periodo-seguimiento.action.service';
import { ProyectoPeriodoSeguimientoDatosGeneralesFragment } from './proyecto-periodo-seguimiento-datos-generales.fragment';

@Component({
  selector: 'sgi-solicitud-proyecto-periodo-seguimiento-datos-generales',
  templateUrl: './proyecto-periodo-seguimiento-datos-generales.component.html',
  styleUrls: ['./proyecto-periodo-seguimiento-datos-generales.component.scss']
})
export class ProyectoPeriodoSeguimientoDatosGeneralesComponent extends FormFragmentComponent<IProyectoPeriodoSeguimiento>
  implements OnInit, OnDestroy {
  formPart: ProyectoPeriodoSeguimientoDatosGeneralesFragment;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  fxFlexProperties3: FxFlexProperties;
  private subscriptions: Subscription[] = [];
  periodoSeguimientosSelectedProyecto: IProyectoPeriodoSeguimiento[] = [];
  FormGroupUtil = FormGroupUtil;

  /** ngx-mat-datetime-picker */
  showSeconds = true;
  defaultTimeStart = [0, 0, 0];
  defaultTimeEnd = [23, 59, 59];
  /** ngx-mat-datetime-picker */

  constructor(
    protected actionService: ProyectoPeriodoSeguimientoActionService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formPart = this.fragment as ProyectoPeriodoSeguimientoDatosGeneralesFragment;
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(36%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexProperties3 = new FxFlexProperties();
    this.fxFlexProperties3.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties3.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadPeriodoSeguimientosSelectedProyecto();

    this.subscriptions.push(
      merge(
        this.formGroup.get('fechaInicio').valueChanges,
        this.formGroup.get('fechaFin').valueChanges
      ).pipe(
        tap(() => this.checkOverlapsPeriodosSeguimiento())
      ).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private loadPeriodoSeguimientosSelectedProyecto(): void {
    this.periodoSeguimientosSelectedProyecto = this.formPart.selectedProyectoPeriodoSeguimientos;
  }

  private checkOverlapsPeriodosSeguimiento(): void {
    const fechaInicioForm = this.formGroup.get('fechaInicio');
    const fechaFinForm = this.formGroup.get('fechaFin');

    const fechaInicio = fechaInicioForm.value ? DateUtils.fechaToDate(fechaInicioForm.value).getTime() : Number.MIN_VALUE;
    const fechaFin = fechaFinForm.value ? DateUtils.fechaToDate(fechaFinForm.value).getTime() : Number.MAX_VALUE;

    const proyectoPeriodoSeguimientos = this.periodoSeguimientosSelectedProyecto.filter(
      element => element.id !== this.formPart.proyectoPeriodoSeguimiento.id);

    const ranges = proyectoPeriodoSeguimientos.map(proyectoPeriodoSeguimiento => {
      return {
        inicio: proyectoPeriodoSeguimiento.fechaInicio ?
          DateUtils.fechaToDate(proyectoPeriodoSeguimiento.fechaInicio).getTime() : Number.MIN_VALUE,
        fin: proyectoPeriodoSeguimiento.fechaFin ? DateUtils.fechaToDate(proyectoPeriodoSeguimiento.fechaFin).getTime() : Number.MAX_VALUE
      };
    });

    if (ranges.some(r => fechaInicio <= r.fin && r.inicio <= fechaFin)) {
      if (fechaInicioForm.value) {
        fechaInicioForm.setErrors({ overlapped: true });
        fechaInicioForm.markAsTouched({ onlySelf: true });
      }

      if (fechaFinForm.value) {
        fechaFinForm.setErrors({ overlapped: true });
        fechaFinForm.markAsTouched({ onlySelf: true });
      }

    } else {
      if (fechaInicioForm.errors) {
        delete fechaInicioForm.errors.overlapped;
        fechaInicioForm.updateValueAndValidity({ onlySelf: true });
      }

      if (fechaFinForm.errors) {
        delete fechaFinForm.errors.overlapped;
        fechaFinForm.updateValueAndValidity({ onlySelf: true });
      }

    }
  }
}
