import { Component } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTableWithoutPaginationComponent } from '@core/component/abstract-table-without-pagination.component';
import { IEvaluacionWithNumComentario } from '@core/models/eti/evaluacion-with-num-comentarios';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestFilter, SgiRestListResult } from '@sgi/framework/http';
import { Observable } from 'rxjs';

const MSG_ERROR = marker('eti.seguimiento.listado.anterior.error');

@Component({
  selector: 'sgi-seguimiento-listado-anterior-memoria',
  templateUrl: './seguimiento-listado-anterior-memoria.component.html',
  styleUrls: ['./seguimiento-listado-anterior-memoria.component.scss']
})
export class SeguimientoListadoAnteriorMemoriaComponent extends AbstractTableWithoutPaginationComponent<IEvaluacionWithNumComentario> {
  memoriaId: number;
  evaluacionId: number;
  evaluaciones$: Observable<IEvaluacionWithNumComentario[]>;

  constructor(
    private readonly memoriaService: MemoriaService,
    protected readonly snackBarService: SnackBarService
  ) {
    super(snackBarService, MSG_ERROR);
  }

  protected createObservable(): Observable<SgiRestListResult<IEvaluacionWithNumComentario>> {
    let observable$ = null;
    if (this.memoriaId && this.evaluacionId) {
      observable$ = this.memoriaService.getEvaluacionesAnteriores(
        this.memoriaId, this.evaluacionId, this.getFindOptions());
    }
    return observable$;
  }

  protected initColumns(): void {
    this.columnas = ['memoria.numReferencia', 'version', 'fechaDictamen', 'dictamen.nombre', 'numComentarios', 'pdf'];
  }

  protected loadTable(reset?: boolean): void {
    this.evaluaciones$ = this.getObservableLoadTable(reset);
  }

  protected createFilters(): SgiRestFilter[] {
    return [];
  }
}
