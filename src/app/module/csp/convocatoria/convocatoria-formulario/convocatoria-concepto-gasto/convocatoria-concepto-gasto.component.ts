import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from '@core/services/dialog.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CSP_ROUTE_NAMES } from '../../../csp-route-names';
import { ROUTE_NAMES } from '@core/route.names';
import { ConvocatoriaConceptoGastoFragment } from './convocatoria-concepto-gasto.fragment';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaConceptoGastoService } from '@core/services/csp/convocatoria-concepto-gasto.service';
import { IConvocatoriaConceptoGastoState } from '../../../convocatoria-concepto-gasto/convocatoria-concepto-gasto.state';

const MSG_DELETE = marker('csp.convocatoria.concepto-gasto.listado.borrar');
const MSG_DELETE_CODIGO_ECONOMICO = marker('csp.convocatoria.concepto-gasto.listado.codigoEconomico.borrar');

@Component({
  selector: 'sgi-convocatoria-concepto-gasto',
  templateUrl: './convocatoria-concepto-gasto.component.html',
  styleUrls: ['./convocatoria-concepto-gasto.component.scss']
})

export class ConvocatoriaConceptoGastoComponent extends FormFragmentComponent<IConvocatoriaConceptoGasto[]> implements OnInit, OnDestroy {
  CSP_ROUTE_NAMES = CSP_ROUTE_NAMES;
  ROUTE_NAMES = ROUTE_NAMES;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  formPart: ConvocatoriaConceptoGastoFragment;
  private subscriptions: Subscription[] = [];

  elementosPagina = [5, 10, 25, 100];
  displayedColumnsPermitidos = ['conceptoGasto.nombre', 'conceptoGasto.descripcion', 'importeMaximo', 'mesInicial', 'mesFinal', 'observaciones', 'acciones'];
  displayedColumnsNoPermitidos = ['conceptoGasto.nombre', 'conceptoGasto.descripcion', 'mesInicial', 'mesFinal', 'observaciones', 'acciones'];

  dataSourcePermitidos = new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGasto>>();
  dataSourceNoPermitidos = new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGasto>>();
  @ViewChild('paginatorPermitidos', { static: true }) paginatorPermitidos: MatPaginator;
  @ViewChild('paginatorNoPermitidos', { static: true }) paginatorNoPermitidos: MatPaginator;
  @ViewChild('sortPermitidos', { static: true }) sortPermitidos: MatSort;
  @ViewChild('sortNoPermitidos', { static: true }) sortNoPermitidos: MatSort;

  filteredCostesIndirectos: Observable<IConvocatoriaConceptoGasto[]>;

  constructor(
    protected actionService: ConvocatoriaActionService,
    private dialogService: DialogService,
    private convocatoriaConceptoGastoService: ConvocatoriaConceptoGastoService
  ) {
    super(actionService.FRAGMENT.ELEGIBILIDAD, actionService);
    this.formPart = this.fragment as ConvocatoriaConceptoGastoFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '1';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSourcePermitidos = new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGasto>>();
    this.dataSourcePermitidos.paginator = this.paginatorPermitidos;
    this.dataSourcePermitidos.sort = this.sortPermitidos;
    this.dataSourceNoPermitidos = new MatTableDataSource<StatusWrapper<IConvocatoriaConceptoGasto>>();
    this.dataSourceNoPermitidos.paginator = this.paginatorNoPermitidos;
    this.dataSourceNoPermitidos.sort = this.sortNoPermitidos;
    this.subscriptions.push(this.formPart?.convocatoriaConceptoGastoPermitido$.subscribe(elements => {
      this.dataSourcePermitidos.data = elements;
      this.filteredCostesIndirectos = this.formPart.getFormGroup().controls.costeIndirecto.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return this.filterCosteIndirecto(value);
          })
        );
    }));
    this.subscriptions.push(this.formPart?.convocatoriaConceptoGastoNoPermitido$.subscribe(elements => {
      this.dataSourceNoPermitidos.data = elements;
    }));

    this.dataSourcePermitidos.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaConceptoGasto>, property: string) => {
        switch (property) {
          default:
            return wrapper.value[property];
        }
      };

    this.dataSourceNoPermitidos.sortingDataAccessor =
      (wrapper: StatusWrapper<IConvocatoriaConceptoGasto>, property: string) => {
        switch (property) {
          default:
            return wrapper.value[property];
        }
      };
  }

  createState(wrapper?: StatusWrapper<IConvocatoriaConceptoGasto>, permitido?: boolean): IConvocatoriaConceptoGastoState {

    if (wrapper && wrapper.value.permitido) {
      permitido = wrapper.value.permitido;
    }

    const convocatoria = this.formPart.convocatoria;
    convocatoria.id = this.formPart.getKey() as number;

    const state: IConvocatoriaConceptoGastoState = {
      convocatoria,
      convocatoriaConceptoGasto: wrapper ? wrapper.value : {} as IConvocatoriaConceptoGasto,
      selectedConvocatoriaConceptoGastos: permitido ? (this.dataSourcePermitidos ? this.dataSourcePermitidos.data.map(element => element.value) : null) : (this.dataSourceNoPermitidos ? this.dataSourceNoPermitidos.data.map(element => element.value) : null),
      permitido,
      readonly: this.formPart.readonly
    };


    return state;
  }

  deleteConvocatoriaConceptoGasto(wrapper: StatusWrapper<IConvocatoriaConceptoGasto>) {
    this.convocatoriaConceptoGastoService.existsCodigosEconomicos(wrapper.value.id).subscribe(res => {
      if (res) {
        this.subscriptions.push(
          this.dialogService.showConfirmation(MSG_DELETE_CODIGO_ECONOMICO).subscribe(
            (aceptado: boolean) => {
              if (aceptado) {
                this.formPart.deleteConvocatoriaConceptoGasto(wrapper);
              }
            }
          )
        );
      } else {
        this.subscriptions.push(
          this.dialogService.showConfirmation(MSG_DELETE).subscribe(
            (aceptado: boolean) => {
              if (aceptado) {
                this.formPart.deleteConvocatoriaConceptoGasto(wrapper);
              }
            }
          )
        );
      }
    });
  }

  private filterCosteIndirecto(value: string | IConvocatoriaConceptoGasto): IConvocatoriaConceptoGasto[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      if (value === null) {
        filterValue = '';
      } else {
        filterValue = value.conceptoGasto.nombre.toLowerCase();
      }
    }

    return this.dataSourcePermitidos.data.filter
      (wrapper => wrapper.value.conceptoGasto.nombre.toLowerCase().includes(filterValue)).map(wrapper => wrapper.value);
  }

  getCosteIndirecto(costeIndirecto: IConvocatoriaConceptoGasto): string {
    const nombreCosteIndirecto = costeIndirecto?.conceptoGasto?.nombre;
    let mesesCosteIndirecto = '';
    if (costeIndirecto?.mesInicial) {
      mesesCosteIndirecto = ' (' + costeIndirecto.mesInicial + (costeIndirecto.mesFinal ? (' - ' + costeIndirecto.mesFinal) : '') + ')';
    }

    return nombreCosteIndirecto ? (nombreCosteIndirecto + mesesCosteIndirecto) : '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}

