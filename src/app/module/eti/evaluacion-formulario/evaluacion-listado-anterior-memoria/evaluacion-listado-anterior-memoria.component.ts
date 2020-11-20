import { Component } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTableWithoutPaginationComponent } from '@core/component/abstract-table-without-pagination.component';
import { IEvaluacionWithNumComentario } from '@core/models/eti/evaluacion-with-num-comentarios';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestFilter, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

const MSG_ERROR = marker('eti.evaluacion.listado.anterior.error');

@Component({
  selector: 'sgi-evaluacion-listado-anterior-memoria',
  templateUrl: './evaluacion-listado-anterior-memoria.component.html',
  styleUrls: ['./evaluacion-listado-anterior-memoria.component.scss']
})
export class EvaluacionListadoAnteriorMemoriaComponent extends AbstractTableWithoutPaginationComponent<IEvaluacionWithNumComentario> {
  memoriaId: number;
  evaluacionId: number;
  evaluaciones$: Observable<IEvaluacionWithNumComentario[]>;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly memoriaService: MemoriaService,
    protected readonly snackBarService: SnackBarService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'constructor()', 'start');
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'constructor()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IEvaluacionWithNumComentario>> {
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'createObservable()', 'start');
    let observable$ = null;
    if (this.memoriaId && this.evaluacionId) {
      observable$ = this.memoriaService.getEvaluacionesAnteriores(
        this.memoriaId, this.evaluacionId, this.getFindOptions());
    }
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'createObservable()', 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'initColumns()', 'start');
    this.columnas = ['memoria.numReferencia', 'version', 'fechaDictamen', 'dictamen.nombre', 'numComentarios', 'pdf'];
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'initColumns()', 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'loadTable()', 'start');
    this.evaluaciones$ = this.getObservableLoadTable(reset);
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'loadTable()', 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'createFilters()', 'start');
    this.logger.debug(EvaluacionListadoAnteriorMemoriaComponent.name, 'createFilters()', 'end');
    return [];
  }
}
