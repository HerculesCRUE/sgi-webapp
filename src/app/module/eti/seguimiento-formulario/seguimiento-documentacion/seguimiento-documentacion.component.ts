import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { NGXLogger } from 'ngx-logger';
import { DocumentacionMemoriaListadoMemoriaComponent } from '../../documentacion-memoria/documentacion-memoria-listado-memoria/documentacion-memoria-listado-memoria.component';
import { SeguimientoEvaluarActionService } from '../../seguimiento/seguimiento-evaluar.action.service';
import { SeguimientoFormularioActionService } from '../seguimiento-formulario.action.service';


@Component({
  selector: 'sgi-seguimiento-documentacion',
  templateUrl: './seguimiento-documentacion.component.html',
  styleUrls: ['./seguimiento-documentacion.component.scss']
})
export class SeguimientoDocumentacionComponent extends FormFragmentComponent<IDocumentacionMemoria> implements AfterViewInit {
  @ViewChild('documentacionMemoriaListado') documentacion: DocumentacionMemoriaListadoMemoriaComponent;

  constructor(
    protected readonly logger: NGXLogger,
    private actionService: SeguimientoFormularioActionService
  ) {
    super(actionService.FRAGMENT.DOCUMENTACION, actionService);
    this.logger.debug(SeguimientoDocumentacionComponent.name, 'constructor()', 'start');
    this.logger.debug(SeguimientoDocumentacionComponent.name, 'constructor()', 'end');
  }

  ngAfterViewInit() {
    this.logger.debug(SeguimientoDocumentacionComponent.name, 'ngAfterViewInit()', 'start');
    this.documentacion.memoriaId = this.actionService.getEvaluacion()?.memoria?.id;
    this.documentacion.tipoEvaluacion = this.actionService.getEvaluacion()?.tipoEvaluacion?.id;
    this.documentacion?.ngAfterViewInit();
    this.logger.debug(SeguimientoDocumentacionComponent.name, 'ngAfterViewInit()', 'end');
  }
}
