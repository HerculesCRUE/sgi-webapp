import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { EvaluacionEvaluacionFragment } from '../evaluacion-formulario/evaluacion-evaluacion/evaluacion-evaluacion.fragment';
import { NGXLogger } from 'ngx-logger';
import { EvaluacionComentarioFragment } from '../evaluacion-formulario/evaluacion-comentarios/evaluacion-comentarios.fragment';
import { EvaluacionFormularioActionService, Gestion } from '../evaluacion-formulario/evaluacion-formulario.action.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { EvaluacionDocumentacionFragment } from '../evaluacion-formulario/evaluacion-documentacion/evaluacion-documentacion.fragment';

@Injectable()
export class EvaluacionActionService extends EvaluacionFormularioActionService {

  constructor(
    private readonly logger: NGXLogger,
    fb: FormBuilder,
    route: ActivatedRoute,
    service: EvaluacionService,
    protected readonly snackBarService: SnackBarService,
    personaFisicaService: PersonaFisicaService) {
    super();
    this.evaluacion = {} as IEvaluacion;
    if (route.snapshot.data.evaluacion) {
      this.evaluacion = route.snapshot.data.evaluacion;
      this.enableEdit();
    }
    this.evaluaciones = new EvaluacionEvaluacionFragment(
      logger, fb, this.evaluacion?.id, snackBarService, service, personaFisicaService);
    this.comentarios = new EvaluacionComentarioFragment(this.logger, this.evaluacion?.id, Gestion.GESTOR, service);
    this.documentacion = new EvaluacionDocumentacionFragment(this.logger, this.evaluacion?.id);


    this.addFragment(this.FRAGMENT.COMENTARIOS, this.comentarios);
    this.addFragment(this.FRAGMENT.EVALUACIONES, this.evaluaciones);
    this.addFragment(this.FRAGMENT.DOCUMENTACION, this.documentacion);
    this.evaluaciones.setComentarios(this.comentarios.comentarios$);
  }

  getGestion(): Gestion {
    return Gestion.GESTOR;
  }
}
