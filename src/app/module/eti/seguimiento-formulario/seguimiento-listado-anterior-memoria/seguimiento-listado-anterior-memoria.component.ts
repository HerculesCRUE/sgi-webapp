import { Component } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractTableWithoutPaginationComponent } from '@core/component/abstract-table-without-pagination.component';
import { IEvaluacionWithNumComentario } from '@core/models/eti/evaluacion-with-num-comentarios';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiRestFilter, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
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
    protected readonly logger: NGXLogger,
    private readonly memoriaService: MemoriaService,
    protected readonly snackBarService: SnackBarService
  ) {
    super(logger, snackBarService, MSG_ERROR);
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'constructor()', 'start');
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'constructor()', 'end');
  }

  protected createObservable(): Observable<SgiRestListResult<IEvaluacionWithNumComentario>> {
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'createObservable()', 'start');
    let observable$ = null;
    if (this.memoriaId && this.evaluacionId) {
      observable$ = this.memoriaService.getEvaluacionesAnteriores(
        this.memoriaId, this.evaluacionId, this.getFindOptions());
    }
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'createObservable()', 'end');
    return observable$;
  }

  protected initColumns(): void {
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'initColumns()', 'start');
    this.columnas = ['memoria.numReferencia', 'version', 'fechaDictamen', 'dictamen.nombre', 'numComentarios', 'pdf'];
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'initColumns()', 'end');
  }

  protected loadTable(reset?: boolean): void {
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'loadTable()', 'start');
    this.evaluaciones$ = this.getObservableLoadTable(reset);
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'loadTable()', 'end');
  }

  protected createFilters(): SgiRestFilter[] {
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'createFilters()', 'start');
    this.logger.debug(SeguimientoListadoAnteriorMemoriaComponent.name, 'createFilters()', 'end');
    return [];
  }
}
