import { Component, Input } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTableWithoutPaginationComponent } from '@core/component/abstract-table-without-pagination.component';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestFilter, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

const MSG_ERROR = marker('eti.documentacion-memoria.listado.error');

@Component({
  selector: 'sgi-documentacion-memoria-listado-memoria',
  templateUrl: './documentacion-memoria-listado-memoria.component.html',
  styleUrls: ['./documentacion-memoria-listado-memoria.component.scss']
})
export class DocumentacionMemoriaListadoMemoriaComponent extends AbstractTableWithoutPaginationComponent<IDocumentacionMemoria>  {
  documentacionMemoria$: Observable<IDocumentacionMemoria[]>;
  @Input() memoriaId: number;
  @Input() tipoEvaluacion: number;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly memoriaService: MemoriaService,
    protected readonly snackBarService: SnackBarService
  ) {
    super(logger, snackBarService, MSG_ERROR);
  }

  protected createObservable(): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'createObservable()', 'start');
    const observable$ = this.memoriaService.getDocumentacionesTipoEvaluacion(this.memoriaId, this.tipoEvaluacion, this.getFindOptions());
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'createObservable()', 'end');
    return observable$;
  }

  protected getObservableLoadTable(reset?: boolean): Observable<IDocumentacionMemoria[]> {
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, `getObservableLoadTable(${reset})`, 'start');
    if (this.memoriaId) {
      this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, `getObservableLoadTable(${reset})`, 'end');
      return super.getObservableLoadTable(reset);
    }
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, `getObservableLoadTable(${reset})`, 'end');
    return null;
  }

  protected initColumns(): void {
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'initColumns()', 'start');
    this.columnas = ['documentoRef', 'acciones'];
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'initColumns()', 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'loadTable()', 'start');
    this.documentacionMemoria$ = this.getObservableLoadTable(reset);
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'loadTable()', 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'createFilters()', 'start');
    this.logger.debug(DocumentacionMemoriaListadoMemoriaComponent.name, 'createFilters()', 'end');
    return [];
  }
}
