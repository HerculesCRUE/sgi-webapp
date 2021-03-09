import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { ISolicitudProyectoEntidadFinanciadoraAjena } from '@core/models/csp/solicitud-proyecto-entidad-financiadora-ajena';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { DialogService } from '@core/services/dialog.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { from, Subscription } from 'rxjs';
import { map, mergeAll, switchMap, takeLast } from 'rxjs/operators';
import { EntidadFinanciadoraDataModal, EntidadFinanciadoraModalComponent } from '../../../modals/entidad-financiadora-modal/entidad-financiadora-modal.component';
import { SolicitudActionService } from '../../solicitud.action.service';
import { SolicitudProyectoEntidadesFinanciadorasFragment } from './solicitud-proyecto-entidades-financiadoras.fragment';


const MODAL_ENTIDAD_FINANCIADORA_TITLE = marker('csp.solicitud.entidades-financiadoras.modal.titulo');
const MSG_DELETE = marker('csp.solicitud.entidades-financiadoras.borrar');

@Component({
  selector: 'sgi-solicitud-proyecto-entidades-financiadoras',
  templateUrl: './solicitud-proyecto-entidades-financiadoras.component.html',
  styleUrls: ['./solicitud-proyecto-entidades-financiadoras.component.scss']
})
export class SolicitudProyectoEntidadesFinanciadorasComponent extends FragmentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  formPart: SolicitudProyectoEntidadesFinanciadorasFragment;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumnsEntidadesFinanciadorasConvocatoria = [
    'nombre',
    'cif',
    'fuenteFinanciacion',
    'ambito',
    'tipoFinanciacion',
    'porcentajeFinanciacion'
  ];

  displayedColumnsEntidadesFinanciadorasAjenas = [
    'nombre',
    'cif',
    'fuenteFinanciacion',
    'ambito',
    'tipoFinanciacion',
    'porcentajeFinanciacion',
    'acciones'
  ];

  elementosPagina: number[] = [5, 10, 25, 100];

  dataSourceEntidadesFinanciadorasConvocatoria = new MatTableDataSource<IConvocatoriaEntidadFinanciadora>();
  @ViewChild('paginatorEntidadesFinanciadorasConvocatoria', { static: true }) paginatorEntidadesFinanciadorasConvocatoria: MatPaginator;
  @ViewChild('sortEntidadesFinanciadorasConvocatoria', { static: true }) sortEntidadesFinanciadorasConvocatoria: MatSort;

  dataSourceEntidadesFinanciadorasAjenas = new MatTableDataSource<StatusWrapper<ISolicitudProyectoEntidadFinanciadoraAjena>>();
  @ViewChild('paginatorEntidadesFinanciadorasAjenas', { static: true }) paginatorEntidadesFinanciadorasAjena: MatPaginator;
  @ViewChild('sortEntidadesFinanciadorasAjenas', { static: true }) sortEntidadesFinanciadorasAjena: MatSort;

  constructor(
    private actionService: SolicitudActionService,
    private matDialog: MatDialog,
    private dialogService: DialogService,
    private convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService
  ) {
    super(actionService.FRAGMENT.ENTIDADES_FINANCIADORAS, actionService);
    this.formPart = this.fragment as SolicitudProyectoEntidadesFinanciadorasFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.actionService.existsDatosProyectos();
    this.formPart.solicitantePersonaRef = this.actionService.getSolicitantePersonaRef();

    this.dataSourceEntidadesFinanciadorasConvocatoria.paginator = this.paginatorEntidadesFinanciadorasConvocatoria;
    this.dataSourceEntidadesFinanciadorasConvocatoria.sortingDataAccessor =
      (entidadFinanciadora: IConvocatoriaEntidadFinanciadora, property: string) => {
        switch (property) {
          case 'nombre':
            return entidadFinanciadora.empresa?.razonSocial;
          case 'cif':
            return entidadFinanciadora.empresa?.numeroDocumento;
          case 'fuenteFinanciacion':
            return entidadFinanciadora.fuenteFinanciacion?.nombre;
          case 'ambito':
            return entidadFinanciadora.fuenteFinanciacion?.tipoAmbitoGeografico.nombre;
          case 'tipoFinanciacion':
            return entidadFinanciadora.tipoFinanciacion?.nombre;
          case 'porcentajeFinanciacion':
            return entidadFinanciadora.porcentajeFinanciacion;
          default:
            return entidadFinanciadora[property];
        }
      };
    this.dataSourceEntidadesFinanciadorasConvocatoria.sort = this.sortEntidadesFinanciadorasConvocatoria;

    this.dataSourceEntidadesFinanciadorasAjenas.paginator = this.paginatorEntidadesFinanciadorasAjena;
    this.dataSourceEntidadesFinanciadorasAjenas.sortingDataAccessor =
      (entidadFinanciadora: StatusWrapper<ISolicitudProyectoEntidadFinanciadoraAjena>, property: string) => {
        switch (property) {
          case 'nombre':
            return entidadFinanciadora.value.empresa?.razonSocial;
          case 'cif':
            return entidadFinanciadora.value.empresa?.numeroDocumento;
          case 'fuenteFinanciacion':
            return entidadFinanciadora.value.fuenteFinanciacion?.nombre;
          case 'ambito':
            return entidadFinanciadora.value.fuenteFinanciacion?.tipoAmbitoGeografico.nombre;
          case 'tipoFinanciacion':
            return entidadFinanciadora.value.tipoFinanciacion?.nombre;
          case 'porcentajeFinanciacion':
            return entidadFinanciadora.value.porcentajeFinanciacion;
          default:
            return entidadFinanciadora[property];
        }
      };
    this.dataSourceEntidadesFinanciadorasAjenas.sort = this.sortEntidadesFinanciadorasAjena;

    const convocatoriaId = this.actionService.getDatosGeneralesSolicitud().convocatoria?.id;
    if (convocatoriaId) {
      const subscriptionEntidadesFinanciadorasConvocatoria = this.convocatoriaService.findEntidadesFinanciadoras(convocatoriaId)
        .pipe(
          map(result => result.items),
          switchMap((entidadesFinanciadoras) => {
            return from(entidadesFinanciadoras)
              .pipe(
                map((entidadesFinanciadora) => {
                  return this.empresaEconomicaService.findById(entidadesFinanciadora.empresa.personaRef)
                    .pipe(
                      map(empresaEconomica => {
                        entidadesFinanciadora.empresa = empresaEconomica;
                        return entidadesFinanciadora;
                      }),
                    );

                }),
                mergeAll(),
                map(() => {
                  return entidadesFinanciadoras;
                })
              );
          }),
          takeLast(1)
        ).subscribe((result) => {
          this.dataSourceEntidadesFinanciadorasConvocatoria.data = result;
        });

      this.subscriptions.push(subscriptionEntidadesFinanciadorasConvocatoria);
    } else {
      this.dataSourceEntidadesFinanciadorasConvocatoria.data = [] as IConvocatoriaEntidadFinanciadora[];
    }

    const subscriptionEntidadesFinanciadorasAjenas = this.formPart.entidadesFinanciadoras$
      .subscribe((entidadesFinanciadoras) => {
        this.dataSourceEntidadesFinanciadorasAjenas.data = entidadesFinanciadoras;
      });
    this.subscriptions.push(subscriptionEntidadesFinanciadorasAjenas);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal(wrapper?: StatusWrapper<ISolicitudProyectoEntidadFinanciadoraAjena>): void {
    const data: EntidadFinanciadoraDataModal = {
      title: MODAL_ENTIDAD_FINANCIADORA_TITLE,
      entidad: wrapper ? wrapper.value : {} as ISolicitudProyectoEntidadFinanciadoraAjena,
      selectedEmpresas: this.dataSourceEntidadesFinanciadorasAjenas.data.map(entidad => entidad.value.empresa),
      readonly: this.formPart.readonly
    };

    const config = {
      data
    };

    const dialogRef = this.matDialog.open(EntidadFinanciadoraModalComponent, config);
    dialogRef.afterClosed().subscribe((entidadFinanciadora) => {
      if (entidadFinanciadora) {
        if (!wrapper) {
          this.formPart.addSolicitudProyectoEntidadFinanciadora(entidadFinanciadora);
        } else if (!wrapper.created) {
          const entidad = new StatusWrapper<ISolicitudProyectoEntidadFinanciadoraAjena>(wrapper.value);
          this.formPart.updateSolicitudProyectoEntidadFinanciadora(entidad);
        }
      }
    });
  }

  deleteEntidadFinanciadora(wrapper: StatusWrapper<ISolicitudProyectoEntidadFinanciadoraAjena>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado) => {
          if (aceptado) {
            this.formPart.deleteSolicitudProyectoEntidadFinanciadora(wrapper);
          }
        }
      )
    );
  }
}
