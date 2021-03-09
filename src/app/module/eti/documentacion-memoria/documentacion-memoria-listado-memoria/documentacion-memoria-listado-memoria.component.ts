import { Component, Input } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTableWithoutPaginationComponent } from '@core/component/abstract-table-without-pagination.component';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestFilter, SgiRestListResult } from '@sgi/framework/http';
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
    private readonly memoriaService: MemoriaService,
    protected readonly snackBarService: SnackBarService
  ) {
    super(snackBarService, MSG_ERROR);
  }

  protected createObservable(): Observable<SgiRestListResult<IDocumentacionMemoria>> {
    const observable$ = this.memoriaService.getDocumentacionesTipoEvaluacion(this.memoriaId, this.tipoEvaluacion, this.getFindOptions());
    return observable$;
  }

  protected getObservableLoadTable(reset?: boolean): Observable<IDocumentacionMemoria[]> {
    if (this.memoriaId) {
      return super.getObservableLoadTable(reset);
    }
    return null;
  }

  protected initColumns(): void {
    this.columnas = ['documentoRef', 'acciones'];
  }

  protected loadTable(reset?: boolean): void {
    this.documentacionMemoria$ = this.getObservableLoadTable(reset);
  }

  protected createFilters(): SgiRestFilter[] {
    return [];
  }
}
