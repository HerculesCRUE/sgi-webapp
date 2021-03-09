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
import { StatusWrapper } from '@core/utils/status-wrapper';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EntidadFinanciadoraDataModal, EntidadFinanciadoraModalComponent } from '../../../modals/entidad-financiadora-modal/entidad-financiadora-modal.component';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { ConvocatoriaEntidadesFinanciadorasFragment } from './convocatoria-entidades-financiadoras.fragment';


const MODAL_ENTIDAD_FINANCIADORA_TITLE = marker('csp.convocatoria.entidades-financiadoras.modal.titulo');
const MSG_DELETE = marker('csp.convocatoria.entidad.financiadora.listado.borrar');

@Component({
  selector: 'sgi-convocatoria-entidades-financiadoras',
  templateUrl: './convocatoria-entidades-financiadoras.component.html',
  styleUrls: ['./convocatoria-entidades-financiadoras.component.scss']
})
export class ConvocatoriaEntidadesFinanciadorasComponent extends FragmentComponent implements OnInit, OnDestroy {
  formPart: ConvocatoriaEntidadesFinanciadorasFragment;
  private subscriptions: Subscription[] = [];

  columns = ['nombre', 'cif', 'fuenteFinanciacion', 'ambito', 'tipoFinanciacion',
    'porcentajeFinanciacion', 'acciones'];
  elementsPage = [5, 10, 25, 100];

  dataSource = new MatTableDataSource<StatusWrapper<IConvocatoriaEntidadFinanciadora>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  selectedEmpresas: IEmpresaEconomica[];

  constructor(
    protected actionService: ConvocatoriaActionService,
    private matDialog: MatDialog,
    private empresaEconomicaService: EmpresaEconomicaService,
    private dialogService: DialogService
  ) {
    super(actionService.FRAGMENT.ENTIDADES_FINANCIADORAS, actionService);
    this.formPart = this.fragment as ConvocatoriaEntidadesFinanciadorasFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getDataSource();
  }

  private getDataSource(): void {
    this.dataSource.data = [];
    this.selectedEmpresas = [];
    this.subscriptions.push(
      this.formPart.convocatoriaEntidadesFinanciadoras$.pipe(
        switchMap(wrappers => {
          return forkJoin(wrappers.map(
            wrapper => {
              return this.empresaEconomicaService.findById(wrapper.value.empresa.personaRef).pipe(
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
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(wrapper?: StatusWrapper<IConvocatoriaEntidadFinanciadora>): void {
    const data: EntidadFinanciadoraDataModal = {
      title: MODAL_ENTIDAD_FINANCIADORA_TITLE,
      entidad: wrapper ? wrapper.value : {} as IConvocatoriaEntidadFinanciadora,
      selectedEmpresas: this.selectedEmpresas,
      readonly: this.formPart.readonly
    };
    const config = {
      data
    };
    const dialogRef = this.matDialog.open(EntidadFinanciadoraModalComponent, config);
    dialogRef.afterClosed().subscribe(entidadFinanciadora => {
      if (entidadFinanciadora) {
        if (!wrapper) {
          this.formPart.addConvocatoriaEntidadFinanciadora(entidadFinanciadora);
        } else if (wrapper.value.id) {
          const entidad = new StatusWrapper<IConvocatoriaEntidadFinanciadora>(wrapper.value);
          this.formPart.updateConvocatoriaEntidadFinanciadora(entidad);
        }
      }
    }
    );
  }

  deleteConvocatoriaEntidadFinanciadora(wrapper: StatusWrapper<IConvocatoriaEntidadFinanciadora>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            const empresa = wrapper.value.empresa;
            this.selectedEmpresas = this.selectedEmpresas.filter(x => x.personaRef !== empresa.personaRef);
            const entidad = new StatusWrapper<IConvocatoriaEntidadFinanciadora>(wrapper.value);
            this.formPart.deleteConvocatoriaEntidadFinanciadora(entidad);
            this.getDataSource();
          }
        }
      )
    );
  }
}
