import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FragmentComponent } from '@core/component/fragment.component';
import { IInforme } from '@core/models/eti/informe';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { MemoriaActionService } from '../../memoria.action.service';
import { MemoriaInformesFragment } from './memoria-informes.fragment';
import { IDocumento } from '@core/models/sgdoc/documento';
import { switchMap } from 'rxjs/operators';
import { DocumentoService, triggerDownloadToUser } from '@core/services/sgdoc/documento.service';

@Component({
  selector: 'sgi-memoria-informes',
  templateUrl: './memoria-informes.component.html',
  styleUrls: ['./memoria-informes.component.scss']
})
export class MemoriaInformesComponent extends FragmentComponent implements OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[] = ['nombre', 'acciones'];
  elementosPagina: number[] = [5, 10, 25, 100];

  dataSourceInforme: MatTableDataSource<StatusWrapper<IInforme>> = new MatTableDataSource<StatusWrapper<IInforme>>();

  private formPart: MemoriaInformesFragment;
  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    protected readonly dialogService: DialogService,
    protected readonly logger: NGXLogger,
    protected matDialog: MatDialog,
    protected memoriaService: MemoriaService,
    protected documentoService: DocumentoService,
    actionService: MemoriaActionService
  ) {
    super(actionService.FRAGMENT.INFORMES, actionService);
    this.logger.debug(MemoriaInformesComponent.name, 'constructor()', 'start');
    this.formPart = this.fragment as MemoriaInformesFragment;
    this.logger.debug(MemoriaInformesComponent.name, 'constructor()', 'end');

  }

  ngOnInit(): void {
    this.logger.debug(MemoriaInformesComponent.name, 'ngOnInit()', 'start');
    super.ngOnInit();
    this.dataSourceInforme = new MatTableDataSource<StatusWrapper<IInforme>>();
    this.dataSourceInforme.paginator = this.paginator;
    this.dataSourceInforme.sort = this.sort;
    this.subscriptions.push(this.formPart?.informes$.subscribe(elements => {
      this.dataSourceInforme.data = elements;
    }));
    this.logger.debug(MemoriaInformesComponent.name, 'ngOnInit()', 'end');
  }


  /**
   * Visualiza el informe seleccionado.
   * @param documentoRef Referencia del informe..
   */
  visualizarInforme(documentoRef: string) {

    this.logger.debug(MemoriaInformesComponent.name,
      'visualizarInforme(documentoRef: string) - start');
    const documento: IDocumento = {} as IDocumento;
    this.documentoService.getInfoFichero(documentoRef).pipe(
      switchMap((documentoInfo: IDocumento) => {
        documento.nombre = documentoInfo.nombre;
        documento.tipo = documentoInfo.tipo;

        return this.documentoService.downloadFichero(documentoRef);
      })
    ).subscribe(response => {
      triggerDownloadToUser(response, documento.nombre);

      this.logger.debug(MemoriaInformesComponent.name,
        'visualizarInforme(documentoRef: string) - end');
    });
  }

  ngOnDestroy(): void {
    this.logger.debug(MemoriaInformesComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(MemoriaInformesComponent.name, 'ngOnDestroy()', 'end');
  }
}
