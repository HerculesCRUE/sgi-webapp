import { Component, OnDestroy, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { MSG_PARAMS } from '@core/i18n';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { TranslateService } from '@ngx-translate/core';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProyectoPeriodoSeguimientoActionService } from '../../proyecto-periodo-seguimiento.action.service';
import { ProyectoPeriodoSeguimientoDatosGeneralesFragment } from './proyecto-periodo-seguimiento-datos-generales.fragment';

const PERIODO_SEGUIMIENTO_CIENTIFICO_OBSERVACIONES_KEY = marker('csp.proyecto-periodo-seguimiento-cientifico.observaciones');
const PERIODO_SEGUIMIENTO_CIENTIFICO_KEY = marker('csp.proyecto-periodo-seguimiento-cientifico');

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
  FormGroupUtil = FormGroupUtil;

  msgParamEntity = {};
  msgParamObservacionesEntity = {};

  constructor(
    protected actionService: ProyectoPeriodoSeguimientoActionService,
    private readonly translate: TranslateService
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

    this.setupI18N();

    this.subscriptions.push(
      merge(
        this.formGroup.get('fechaInicio').valueChanges,
        this.formGroup.get('fechaFin').valueChanges
      ).pipe(
        tap(() => this.checkOverlapsPeriodosSeguimiento())
      ).subscribe()
    );
  }

  private setupI18N(): void {
    this.translate.get(
      PERIODO_SEGUIMIENTO_CIENTIFICO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      PERIODO_SEGUIMIENTO_CIENTIFICO_OBSERVACIONES_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamObservacionesEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE, ...MSG_PARAMS.CARDINALIRY.PLURAL });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private checkOverlapsPeriodosSeguimiento(): void {
    const fechaInicioForm = this.formGroup.get('fechaInicio');
    const fechaFinForm = this.formGroup.get('fechaFin');

    const fechaInicio = fechaInicioForm.value ? fechaInicioForm.value.toMillis() : Number.MIN_VALUE;
    const fechaFin = fechaFinForm.value ? fechaFinForm.value.toMillis() : Number.MAX_VALUE;

    const ranges = this.actionService.proyectoPeriodoSeguimiento
      .map(periodo => {
        return {
          inicio: periodo.fechaInicio ? periodo.fechaInicio.toMillis() : Number.MIN_VALUE,
          fin: periodo.fechaFin ? periodo.fechaFin.toMillis() : Number.MAX_VALUE
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
