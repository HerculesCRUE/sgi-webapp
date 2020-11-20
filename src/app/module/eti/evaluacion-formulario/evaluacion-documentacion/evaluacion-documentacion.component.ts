import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { NGXLogger } from 'ngx-logger';

import { DocumentacionMemoriaListadoMemoriaComponent } from '../../documentacion-memoria/documentacion-memoria-listado-memoria/documentacion-memoria-listado-memoria.component';
import { EvaluacionFormularioActionService } from '../evaluacion-formulario.action.service';


@Component({
  selector: 'sgi-evaluacion-documentacion',
  templateUrl: './evaluacion-documentacion.component.html',
  styleUrls: ['./evaluacion-documentacion.component.scss']
})
export class EvaluacionDocumentacionComponent extends FormFragmentComponent<IDocumentacionMemoria> implements AfterViewInit {

  @ViewChild('documentacionMemoriaListado') documentacion: DocumentacionMemoriaListadoMemoriaComponent;

  constructor(
    protected readonly logger: NGXLogger,
    private actionService: EvaluacionFormularioActionService
  ) {
    super(actionService.FRAGMENT.DOCUMENTACION, actionService);
    this.logger.debug(EvaluacionDocumentacionComponent.name, 'constructor()', 'start');
    this.logger.debug(EvaluacionDocumentacionComponent.name, 'constructor()', 'end');
  }

  ngAfterViewInit() {
    this.logger.debug(EvaluacionDocumentacionComponent.name, 'ngAfterViewInit()', 'start');
    this.documentacion.memoriaId = this.actionService.getEvaluacion()?.memoria?.id;
    this.documentacion.tipoEvaluacion = this.actionService.getEvaluacion()?.tipoEvaluacion?.id;
    this.documentacion.ngAfterViewInit();
    this.logger.debug(EvaluacionDocumentacionComponent.name, 'ngAfterViewInit()', 'end');
  }
}
