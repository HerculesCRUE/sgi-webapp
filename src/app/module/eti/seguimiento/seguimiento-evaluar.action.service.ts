import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { ActionService } from '@core/services/action-service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { SeguimientoComentarioFragment } from '../seguimiento-formulario/seguimiento-comentarios/seguimiento-comentarios.fragment';
import { SeguimientoDatosMemoriaFragment } from '../seguimiento-formulario/seguimiento-datos-memoria/seguimiento-datos-memoria.fragment';
import { SeguimientoDocumentacionFragment } from '../seguimiento-formulario/seguimiento-documentacion/seguimiento-documentacion.fragment';
import { Gestion, SeguimientoFormularioActionService } from '../seguimiento-formulario/seguimiento-formulario.action.service';


@Injectable()
export class SeguimientoEvaluarActionService extends SeguimientoFormularioActionService {

  constructor(
    protected readonly logger: NGXLogger,
    fb: FormBuilder,
    route: ActivatedRoute,
    service: EvaluacionService,
    personaFisicaService: PersonaFisicaService
  ) {
    super();
    this.evaluacion = {} as IEvaluacion;
    if (route.snapshot.data.evaluacion) {
      this.evaluacion = route.snapshot.data.evaluacion;
      this.enableEdit();
    }
    this.comentarios = new SeguimientoComentarioFragment(this.logger, this.evaluacion?.id, Gestion.EVALUADOR, service);
    this.datosMemoria = new SeguimientoDatosMemoriaFragment(this.logger, fb, this.evaluacion?.id, service, personaFisicaService);
    this.documentacion = new SeguimientoDocumentacionFragment(this.logger, this.evaluacion?.id);

    this.addFragment(this.FRAGMENT.COMENTARIOS, this.comentarios);
    this.addFragment(this.FRAGMENT.MEMORIA, this.datosMemoria);
    this.addFragment(this.FRAGMENT.DOCUMENTACION, this.documentacion);
  }

  getEvaluacion(): IEvaluacion {
    return this.evaluacion;
  }

  getGestion(): Gestion {
    return Gestion.EVALUADOR;
  }
}
