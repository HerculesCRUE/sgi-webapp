import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IProyectoProrroga, TIPO_MAP } from '@core/models/csp/proyecto-prorroga';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { Subscription } from 'rxjs';
import { ProyectoProrrogaActionService } from '../../proyecto-prorroga.action.service';
import { ProyectoProrrogaDatosGeneralesFragment } from './proyecto-prorroga-datos-generales.fragment';

@Component({
  selector: 'sgi-solicitud-proyecto-prorroga-datos-generales',
  templateUrl: './proyecto-prorroga-datos-generales.component.html',
  styleUrls: ['./proyecto-prorroga-datos-generales.component.scss']
})
export class ProyectoProrrogaDatosGeneralesComponent extends FormFragmentComponent<IProyectoProrroga>
  implements OnInit, OnDestroy {
  formPart: ProyectoProrrogaDatosGeneralesFragment;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  fxFlexProperties3: FxFlexProperties;
  private subscriptions: Subscription[] = [];
  periodoSeguimientosSelectedProyecto: IProyectoProrroga[] = [];
  FormGroupUtil = FormGroupUtil;



  constructor(
    protected actionService: ProyectoProrrogaActionService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formPart = this.fragment as ProyectoProrrogaDatosGeneralesFragment;
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
    this.loadProrrogasSelectedProyecto();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private loadProrrogasSelectedProyecto(): void {
    this.periodoSeguimientosSelectedProyecto = this.formPart.selectedProyectoProrrogas;
  }

  get TIPO_MAP() {
    return TIPO_MAP;
  }

}
