import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IComite } from '@core/models/eti/comite';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { IEstadoRetrospectiva } from '@core/models/eti/estado-retrospectiva';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { IDocumento } from '@core/models/sgdoc/documento';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { DocumentoService, triggerDownloadToUser } from '@core/services/sgdoc/documento.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MemoriaActionService } from '../../memoria.action.service';
import { MemoriaDocumentacionMemoriaModalComponent } from '../../modals/memoria-documentacion-memoria-modal/memoria-documentacion-memoria-modal.component';
import { MemoriaDocumentacionSeguimientosModalComponent } from '../../modals/memoria-documentacion-seguimientos-modal/memoria-documentacion-seguimientos-modal.component';
import { MemoriaDocumentacionFragment, TIPO_DOCUMENTACION } from './memoria-documentacion.fragment';

const MSG_CONFIRM_DELETE = marker('eti.memoria.documentacion.listado.eliminar');

@Component({
  selector: 'sgi-memoria-documentacion',
  templateUrl: './memoria-documentacion.component.html',
  styleUrls: ['./memoria-documentacion.component.scss']
})
export class MemoriaDocumentacionComponent extends FragmentComponent implements OnInit, OnDestroy {

  private formPart: MemoriaDocumentacionFragment;

  private subscriptions: Subscription[] = [];

  dataSourceDocumentoMemoria: MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>;
  dataSourceSeguimientoAnual: MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>;
  dataSourceSeguimientoFinal: MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>;
  dataSourceRetrospectiva: MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>;

  @ViewChild('paginatorDocumentacionMemoria', { static: true }) paginatorDocumentacionMemoria: MatPaginator;
  @ViewChild('paginatorSeguimientoAnual', { static: true }) paginatorSeguimientoAnual: MatPaginator;
  @ViewChild('paginatorSeguimientoFinal', { static: true }) paginatorSeguimientoFinal: MatPaginator;
  @ViewChild('paginatorRetrospectiva', { static: true }) paginatorRetrospectiva: MatPaginator;

  @ViewChild('sortDocumentacionMemoria', { static: true }) sortDocumentacionMemoria: MatSort;
  @ViewChild('sortSeguimientoAnual', { static: true }) sortSeguimientoAnual: MatSort;
  @ViewChild('sortSeguimientoFinal', { static: true }) sortSeguimientoFinal: MatSort;
  @ViewChild('sortRetrospectiva', { static: true }) sortRetrospectiva: MatSort;


  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumnsDocumentoMemoria: string[] = ['documentoRef', 'tipoDocumento', 'aportado', 'acciones'];
  elementosPaginaDocumentoMemoria: number[] = [5, 10, 25, 100];

  displayedColumnsSeguimientoAnual: string[] = ['documentoRef', 'acciones'];
  elementosPaginaSeguimientoAnual: number[] = [5, 10, 25, 100];

  displayedColumnsSeguimientoFinal: string[] = ['documentoRef', 'acciones'];
  elementosPaginaSeguimientoFinal: number[] = [5, 10, 25, 100];

  displayedColumnsRetrospectiva: string[] = ['documentoRef', 'acciones'];
  elementosPaginaRetrospectiva: number[] = [5, 10, 25, 100];

  documentacionesMemoria$: BehaviorSubject<StatusWrapper<IDocumentacionMemoria>[]>;
  documentacionesSeguimientoAnual$: BehaviorSubject<StatusWrapper<IDocumentacionMemoria>[]>;
  documentacionesSeguimientoFinal$: BehaviorSubject<StatusWrapper<IDocumentacionMemoria>[]>;
  documentacionesRetrospectiva$: BehaviorSubject<StatusWrapper<IDocumentacionMemoria>[]>;

  get comite(): IComite {
    return this.actionService.getComite();
  }

  get estadoMemoria(): TipoEstadoMemoria {
    return this.actionService.getEstadoMemoria();
  }

  get estadoRetrospectiva(): IEstadoRetrospectiva {
    return this.actionService.getRetrospectiva()?.estadoRetrospectiva;
  }

  constructor(
    protected readonly dialogService: DialogService,
    protected matDialog: MatDialog,
    private actionService: MemoriaActionService,
    protected readonly documentoService: DocumentoService) {

    super(actionService.FRAGMENT.DOCUMENTACION, actionService);

    this.formPart = this.fragment as MemoriaDocumentacionFragment;

    this.documentacionesMemoria$ = (this.fragment as MemoriaDocumentacionFragment).documentacionesMemoria$;
    this.documentacionesSeguimientoAnual$ = (this.fragment as MemoriaDocumentacionFragment).documentacionesSeguimientoAnual$;
    this.documentacionesSeguimientoFinal$ = (this.fragment as MemoriaDocumentacionFragment).documentacionesSeguimientoFinal$;
    this.documentacionesRetrospectiva$ = (this.fragment as MemoriaDocumentacionFragment).documentacionesRetrospectiva$;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.dataSourceDocumentoMemoria = new MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>();
    this.dataSourceDocumentoMemoria.paginator = this.paginatorDocumentacionMemoria;
    this.dataSourceDocumentoMemoria.sort = this.sortDocumentacionMemoria;
    this.formPart.documentacionesMemoria$.subscribe(elements => {
      this.dataSourceDocumentoMemoria.data = elements;
    });

    this.dataSourceDocumentoMemoria.sortingDataAccessor =
      (wrapper: StatusWrapper<IDocumentacionMemoria>, property: string) => {
        switch (property) {
          case 'tipoDocumento':
            return wrapper.value.tipoDocumento?.nombre;
          default:
            return wrapper.value[property];
        }
      };

    this.dataSourceSeguimientoAnual = new MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>();
    this.dataSourceSeguimientoAnual.paginator = this.paginatorSeguimientoAnual;
    this.dataSourceSeguimientoAnual.sort = this.sortSeguimientoAnual;
    this.formPart.documentacionesSeguimientoAnual$.subscribe(elements => {
      this.dataSourceSeguimientoAnual.data = elements;
    });

    this.dataSourceSeguimientoAnual.sortingDataAccessor =
      (wrapper: StatusWrapper<IDocumentacionMemoria>, property: string) => {
        switch (property) {
          default:
            return wrapper.value[property];
        }
      };

    this.dataSourceSeguimientoFinal = new MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>();
    this.dataSourceSeguimientoFinal.paginator = this.paginatorSeguimientoFinal;
    this.dataSourceSeguimientoFinal.sort = this.sortSeguimientoFinal;
    this.formPart.documentacionesSeguimientoFinal$.subscribe(elements => {
      this.dataSourceSeguimientoFinal.data = elements;
    });

    this.dataSourceSeguimientoFinal.sortingDataAccessor =
      (wrapper: StatusWrapper<IDocumentacionMemoria>, property: string) => {
        switch (property) {
          default:
            return wrapper.value[property];
        }
      };

    this.dataSourceRetrospectiva = new MatTableDataSource<StatusWrapper<IDocumentacionMemoria>>();
    this.dataSourceRetrospectiva.paginator = this.paginatorRetrospectiva;
    this.dataSourceRetrospectiva.sort = this.sortRetrospectiva;
    this.formPart.documentacionesRetrospectiva$.subscribe(elements => {
      this.dataSourceRetrospectiva.data = elements;
    });

    this.dataSourceRetrospectiva.sortingDataAccessor =
      (wrapper: StatusWrapper<IDocumentacionMemoria>, property: string) => {
        switch (property) {
          default:
            return wrapper.value[property];
        }
      };
  }

  openModalDocumentacionMemoria(): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: this.dataSourceDocumentoMemoria.data,
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(MemoriaDocumentacionMemoriaModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (documentacionInicial: StatusWrapper<IDocumentacionMemoria>) => {
        if (documentacionInicial) {
          this.formPart.setChanges(true);
          if (documentacionInicial.created) {
            this.formPart.addDocumentacion(documentacionInicial.value);
          }

        }
      }
    );
  }

  openModalDocumentacionSeguimiento(tipoSeguimiento: number, documentacion?: StatusWrapper<IDocumentacionMemoria>): void {
    const config = {
      width: GLOBAL_CONSTANTS.widthModalCSP,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: documentacion ? documentacion.value : {} as IDocumentacionMemoria,
      autoFocus: false
    };

    const dialogRef = this.matDialog.open(MemoriaDocumentacionSeguimientosModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (documentacionSeguimiento: StatusWrapper<IDocumentacionMemoria>) => {
        if (documentacionSeguimiento) {
          this.formPart.setChanges(true);
          if (documentacionSeguimiento.created) {
            this.formPart.addDocumentacionSeguimiento(documentacionSeguimiento.value, tipoSeguimiento);
          }

        }
      }
    );
  }

  /**
   * Elimina la documentación.
   *
   * @param tipoSeguimiento Tipo del seguimiento.
   * @param wrappedDocumentacion documentación a eliminar.
   */
  deleteDocumentacionSeguimiento(tipoSeguimiento: number, wrappedDocumentacion: StatusWrapper<IDocumentacionMemoria>): void {
    const dialogSubscription = this.dialogService.showConfirmation(
      MSG_CONFIRM_DELETE
    ).pipe(switchMap((accept) => {
      if (accept) {
        return of(this.formPart.deletedDocumentacionSeguimiento(tipoSeguimiento, wrappedDocumentacion));
      }
      return of();
    })).subscribe(
      () => {
        wrappedDocumentacion.value.aportado = false;
        wrappedDocumentacion.setEdited();
      }
    );

    this.subscriptions.push(dialogSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach(x => x.unsubscribe());
  }

  /**
   * Devuelve si una memoria se encuentra en el estado de añadir documentación inicial.
   * EN ELABORACION, COMPLETADA, FAVORABLE PENDIENTE DE MODIFICACIONES MINIMAS,
   * PENDIENTE DE CORRECCIONES, NO PROCEDE EVALUAR
   *
   */
  hasPermisoUpdateDocumentacionInicial(): boolean {
    return this.estadoMemoria.id === 1 || this.estadoMemoria.id === 2
      || this.estadoMemoria.id === 6 || this.estadoMemoria.id === 7
      || this.estadoMemoria.id === 8;
  }

  /**
   * Devuelve si una memoria se encuentra en el estado de añadir documentación seguimiento anual.
   * FIN DE EVALUACION, COMPLETADA SEGUIMIENTO ANUAL
   *
   */
  hasPermisoUpdateDocumentacionSeguimientoAnual(): boolean {
    return this.estadoMemoria.id === 9 || this.estadoMemoria.id === 11;
  }

  /**
   * Devuelve si una memoria se encuentra en el estado de añadir documentación seguimiento final.
   * FIN DE EVALUACION SEGUIMIENTO ANUAL, COMPLETADA SEGUIMIENTO FINAL, EN ACLARACION SEGUIMIENTO FINAL
   *
   */
  hasPermisoUpdateDocumentacionSeguimientoFinal(): boolean {
    return this.estadoMemoria.id === 14 || this.estadoMemoria.id === 16 || this.estadoMemoria.id === 21;
  }

  /**
   * Devuelve si una retrospectiva se encuentra en el estado de añadir documentación retrospectiva
   * PENDIENTE, COMPLETADA
   */
  hasPermisoUpdateDocumentacionRetrospectiva(): boolean {
    return this.estadoRetrospectiva?.id === 1 || this.estadoRetrospectiva?.id === 2;
  }

  /**
   * Visualiza el documento seleccionado.
   * @param documentoRef Referencia del documento.
   */
  visualizarDocumento(documentoRef: string) {
    const documento: IDocumento = {} as IDocumento;
    this.documentoService.getInfoFichero(documentoRef).pipe(
      switchMap((documentoInfo: IDocumento) => {
        documento.nombre = documentoInfo.nombre;
        documento.tipo = documentoInfo.tipo;
        return this.documentoService.downloadFichero(documentoRef);
      })
    ).subscribe(response => {
      triggerDownloadToUser(response, documento.nombre);
    });
  }

  public get documentacionTipo(): typeof TIPO_DOCUMENTACION {
    return TIPO_DOCUMENTACION;
  }

}
