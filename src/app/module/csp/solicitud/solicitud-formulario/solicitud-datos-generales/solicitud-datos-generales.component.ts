import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { FORMULARIO_SOLICITUD_MAP } from '@core/enums/formulario-solicitud';
import { ESTADO_MAP } from '@core/models/csp/estado-solicitud';
import { ISolicitud } from '@core/models/csp/solicitud';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SolicitudModalidadEntidadConvocanteModalComponent, SolicitudModalidadEntidadConvocanteModalData } from '../../modals/solicitud-modalidad-entidad-convocante-modal/solicitud-modalidad-entidad-convocante-modal.component';
import { SolicitudActionService } from '../../solicitud.action.service';
import { SolicitudDatosGeneralesFragment, SolicitudModalidadEntidadConvocanteListado } from './solicitud-datos-generales.fragment';

const MSG_ERROR_INIT = marker('csp.solicitud.datosGenerales.error.cargar');

@Component({
  selector: 'sgi-solicitud-datos-generales',
  templateUrl: './solicitud-datos-generales.component.html',
  styleUrls: ['./solicitud-datos-generales.component.scss']
})
export class SolicitudDatosGeneralesComponent extends FormFragmentComponent<ISolicitud> implements OnInit, OnDestroy {

  formPart: SolicitudDatosGeneralesFragment;

  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesOne: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxFlexPropertiesEntidad: FxFlexProperties;

  private unidadesGestion = [] as IUnidadGestion[];
  unidadesGestionFiltered$: Observable<IUnidadGestion[]>;

  totalElementos: number;
  displayedColumns: string[];
  elementosPagina: number[];

  dataSourceEntidadesConvocantes: MatTableDataSource<SolicitudModalidadEntidadConvocanteListado>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subscriptions = [] as Subscription[];

  get FORMULARIO_SOLICITUD_MAP() {
    return FORMULARIO_SOLICITUD_MAP;
  }

  get ESTADO_MAP() {
    return ESTADO_MAP;
  }

  constructor(
    private readonly logger: NGXLogger,
    protected actionService: SolicitudActionService,
    private snackBarService: SnackBarService,
    private unidadGestionService: UnidadGestionService,
    private matDialog: MatDialog
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formPart = this.fragment as SolicitudDatosGeneralesFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesEntidad = new FxFlexProperties();
    this.fxFlexPropertiesEntidad.sm = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.md = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.gtMd = '0 1 calc(36%-10px)';
    this.fxFlexPropertiesEntidad.order = '3';

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(36%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '4';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.elementosPagina = [5, 10, 25, 100];
    this.displayedColumns = ['entidadConvocante', 'plan', 'programaConvocatoria', 'modalidadSolicitud', 'acciones'];
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadUnidadesGestion();

    this.dataSourceEntidadesConvocantes = new MatTableDataSource<SolicitudModalidadEntidadConvocanteListado>();

    this.dataSourceEntidadesConvocantes.sortingDataAccessor =
      (entidadConvocanteModalidad: SolicitudModalidadEntidadConvocanteListado, property: string) => {
        switch (property) {
          case 'entidadConvocante':
            return entidadConvocanteModalidad.entidadConvocante.entidad.razonSocial;
          case 'plan':
            return entidadConvocanteModalidad.plan.nombre;
          case 'programaConvocatoria':
            return entidadConvocanteModalidad.entidadConvocante.programa.nombre;
          case 'modalidadSolicitud':
            return entidadConvocanteModalidad.modalidad?.value.programa?.nombre;
          default:
            return entidadConvocanteModalidad[property];
        }
      };

    this.subscriptions.push(this.formPart.entidadesConvocantesModalidad$.subscribe(elements => {
      // Bind on new data where convocatoria is selected
      if (this.formGroup.controls.convocatoria.value) {
        this.dataSourceEntidadesConvocantes.paginator = this.paginator;
        this.sort?.sort(({ id: 'entidadConvocante', start: 'asc' }) as MatSortable);
        this.dataSourceEntidadesConvocantes.sort = this.sort;
      }
      this.dataSourceEntidadesConvocantes.data = elements;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Devuelve el nombre de una gestión unidad.
   *
   * @param unidadGestion gestión unidad.
   * @returns nombre de una gestión unidad.
   */
  getUnidadGestion(unidadGestion?: IUnidadGestion): string | undefined {
    return typeof unidadGestion === 'string' ? unidadGestion : unidadGestion?.nombre;
  }

  /**
   * Apertura de modal de modadidad solicitud
   *
   * @param entidadConvocanteModalidad EntidadConvocanteModalidad que se carga en el modal para modificarlo.
   */
  openModalSelectModalidad(entidadConvocanteModalidad: SolicitudModalidadEntidadConvocanteListado): void {
    const data: SolicitudModalidadEntidadConvocanteModalData = {
      entidad: entidadConvocanteModalidad.entidadConvocante.entidad,
      plan: entidadConvocanteModalidad.plan,
      programa: entidadConvocanteModalidad.entidadConvocante.programa,
      modalidad: entidadConvocanteModalidad.modalidad?.value,
      readonly: this.formPart.readonly
    };

    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data,
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(SolicitudModalidadEntidadConvocanteModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (entidadConvocanteModalidadModal: SolicitudModalidadEntidadConvocanteModalData) => {

        if (!entidadConvocanteModalidadModal) {
          return;
        }

        if (!entidadConvocanteModalidad.modalidad) {
          this.formPart.addSolicitudModalidad(entidadConvocanteModalidadModal.modalidad);
        } else if (!entidadConvocanteModalidadModal.modalidad) {
          this.formPart.deleteSolicitudModalidad(entidadConvocanteModalidad.modalidad);
        } else if (!entidadConvocanteModalidad.modalidad.created) {
          this.formPart.updateSolicitudModalidad(entidadConvocanteModalidadModal.modalidad);
        }
      }
    );

  }

  /**
   * Carga la lista de unidades de gestion seleccionables por el usuario
   */
  private loadUnidadesGestion() {
    this.subscriptions.push(
      this.unidadGestionService.findAllRestringidos().subscribe(
        res => {
          this.unidadesGestion = res.items;
          this.unidadesGestionFiltered$ = this.formGroup.controls.unidadGestion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtroUnidadGestion(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT);
        }
      )
    );
  }

  /**
   * Filtra la lista por el value
   *
   * @param value del input para autocompletar
   * @returns Lista filtrada
   */
  private filtroUnidadGestion(value: string | IUnidadGestion): IUnidadGestion[] {
    // Si no es un string no se filtra
    if (typeof value !== 'string') {
      return this.unidadesGestion;
    }

    const filterValue = value.toString().toLowerCase();
    return this.unidadesGestion.filter(unidadGestion => unidadGestion.nombre.toLowerCase().includes(filterValue));
  }

}
