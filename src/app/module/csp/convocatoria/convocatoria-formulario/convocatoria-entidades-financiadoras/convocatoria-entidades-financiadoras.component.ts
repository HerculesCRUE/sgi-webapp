import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { DialogService } from '@core/services/dialog.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { of, Subscription } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaEntidadFinanciadoraDataModal, ConvocatoriaEntidadFinanciadoraModalComponent } from '../../modals/convocatoria-entidad-financiadora-modal/convocatoria-entidad-financiadora-modal.component';
import { ConvocatoriaEntidadesFinanciadorasFragment } from './convocatoria-entidades-financiadoras.fragment';

const MSG_DELETE = marker('csp.convocatoria.entidad.financiadora.listado.borrar');

export interface ConvocatoriaEntidadFinanciadoraData {
  entidad: IConvocatoriaEntidadFinanciadora;
  empresa: IEmpresaEconomica;
}

@Component({
  selector: 'sgi-convocatoria-entidades-financiadoras',
  templateUrl: './convocatoria-entidades-financiadoras.component.html',
  styleUrls: ['./convocatoria-entidades-financiadoras.component.scss']
})
export class ConvocatoriaEntidadesFinanciadorasComponent extends FragmentComponent implements OnInit, OnDestroy {
  private formPart: ConvocatoriaEntidadesFinanciadorasFragment;
  private subscriptions: Subscription[] = [];

  columns = ['nombre', 'cif', 'fuenteFinanciacion', 'ambito', 'tipoFinanciacion',
    'porcentajeFinanciacion', 'acciones'];
  elementsPage = [5, 10, 25, 100];

  dataSource = new MatTableDataSource<StatusWrapper<ConvocatoriaEntidadFinanciadoraData>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  selectedEmpresas: IEmpresaEconomica[];

  constructor(
    protected readonly logger: NGXLogger,
    protected readonly actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private readonly empresaEconomicaService: EmpresaEconomicaService,
    private readonly dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.ENTIDADES_FINANCIADORAS, actionService);
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as ConvocatoriaEntidadesFinanciadorasFragment;
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getDataSource();
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, 'ngOnInit()', 'end');
  }

  private getDataSource(): void {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, `${this.getDataSource.name}()`, 'start');
    this.dataSource.data = [];
    this.selectedEmpresas = [];
    this.subscriptions.push(
      this.formPart.convocatoriaEntidadesFinanciadoras$.pipe(
        map(wrappers => {
          return wrappers.map(wrapper => {
            const data = {
              empresa: {} as IEmpresaEconomica,
              entidad: wrapper.value
            } as ConvocatoriaEntidadFinanciadoraData;
            return new StatusWrapper<ConvocatoriaEntidadFinanciadoraData>(data);
          });
        }),
        switchMap(wrappers => {
          return forkJoin(wrappers.map(
            wrapper => {
              return this.empresaEconomicaService.findById(wrapper.value.entidad.entidadRef).pipe(
                map(empresa => {
                  this.selectedEmpresas.push(empresa);
                  wrapper.value.empresa = empresa;
                  return wrapper;
                }),
                catchError(() => {
                  return of(wrapper);
                })
              );
            })
          );
        })
      ).subscribe(elements => {
        this.dataSource.data = elements;
        this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, `${this.getDataSource.name}()`, 'end');
      })
    );
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, 'ngOnDestroy()', 'end');
  }

  openModal(wrapper?: StatusWrapper<ConvocatoriaEntidadFinanciadoraData>): void {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, `${this.openModal.name}()`, 'start');
    const newData: ConvocatoriaEntidadFinanciadoraDataModal = {
      empresa: {} as IEmpresaEconomica,
      entidad: {} as IConvocatoriaEntidadFinanciadora,
      selectedEmpresas: this.selectedEmpresas
    };
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: wrapper ? wrapper.value : newData
    };
    const dialogRef = this.matDialog.open(ConvocatoriaEntidadFinanciadoraModalComponent, config);
    dialogRef.afterClosed().subscribe(entidadFinanciadora => {
      if (entidadFinanciadora) {
        if (wrapper) {
          const entidad = new StatusWrapper<IConvocatoriaEntidadFinanciadora>(wrapper.value.entidad);
          this.formPart.updateConvocatoriaEntidadFinanciadora(entidad);
        } else {
          this.formPart.addConvocatoriaEntidadFinanciadora(entidadFinanciadora);
        }
        this.getDataSource();
      }
      this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name, `${this.openModal.name}()`, 'end');
    }
    );
  }

  deleteConvocatoriaEntidadFinanciadora(wrapper: StatusWrapper<ConvocatoriaEntidadFinanciadoraData>) {
    this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name,
      `${this.deleteConvocatoriaEntidadFinanciadora.name}(${wrapper})`, 'start');
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            const empresa = wrapper.value.empresa;
            this.selectedEmpresas = this.selectedEmpresas.filter(x => x.personaRef !== empresa.personaRef);
            const entidad = new StatusWrapper<IConvocatoriaEntidadFinanciadora>(wrapper.value.entidad);
            this.formPart.deleteConvocatoriaEntidadFinanciadora(entidad);
            this.getDataSource();
          }
          this.logger.debug(ConvocatoriaEntidadesFinanciadorasComponent.name,
            `${this.deleteConvocatoriaEntidadFinanciadora.name}(${wrapper})`, 'end');
        }
      )
    );
  }
}
