import { Component, OnDestroy, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ConceptoGastoService } from '@core/services/csp/concepto-gasto.service';
import { IConceptoGasto } from '@core/models/csp/concepto-gasto';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { ConvocatoriaConceptoGastoFragment } from './convocatoria-concepto-gasto.fragment';
import { ConvocatoriaConceptoGastoActionService } from '../../convocatoria-concepto-gasto.action.service';

const MSG_ERROR_INIT = marker('csp.convocatoria.concepto-gasto.error.cargar');
const MSG_ANADIR = marker('botones.aniadir');
const MSG_ACEPTAR = marker('botones.aceptar');
@Component({
  templateUrl: './convocatoria-concepto-gasto.component.html',
  styleUrls: ['./convocatoria-concepto-gasto.component.scss']
})
export class ConvocatoriaConceptoGastoComponent extends FormFragmentComponent<IConvocatoriaConceptoGasto> implements OnInit, OnDestroy {
  formPart: ConvocatoriaConceptoGastoFragment;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;

  private subscriptions: Subscription[] = [];
  conceptoGastosFiltered: IConceptoGasto[];
  conceptoGastos$: Observable<IConceptoGasto[]>;

  textSaveOrUpdate: string;

  constructor(
    private logger: NGXLogger,
    private snackBarService: SnackBarService,
    private conceptoGastoService: ConceptoGastoService,
    protected actionService: ConvocatoriaConceptoGastoActionService
  ) {
    super(actionService.FRAGMENT.CONCEPTO_GASTO, actionService);
    this.formPart = this.fragment as ConvocatoriaConceptoGastoFragment;
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadConceptoGastos();
    this.textSaveOrUpdate = this.formPart.convocatoriaConceptoGasto.conceptoGasto ? MSG_ACEPTAR : MSG_ANADIR;
  }


  loadConceptoGastos() {
    this.subscriptions.push(
      this.conceptoGastoService.findAll().subscribe(
        (res: SgiRestListResult<IConceptoGasto>) => {
          this.conceptoGastosFiltered = res.items;
          this.conceptoGastos$ = this.formGroup.controls.conceptoGasto.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroConceptoGasto(value))
            );
        },
        (error) => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.error(error);
        }
      )
    );
  }

  filtroConceptoGasto(value: string): IConceptoGasto[] {
    const filterValue = value.toString().toLowerCase();
    return this.conceptoGastosFiltered.filter(tipoLazoEnlace => tipoLazoEnlace.nombre.toLowerCase().includes(filterValue));
  }

  getNombreConceptoGasto(conceptoGasto?: IConceptoGasto): string | undefined {
    return typeof conceptoGasto === 'string' ? conceptoGasto : conceptoGasto?.nombre;
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach(x => x.unsubscribe());
  }

}
