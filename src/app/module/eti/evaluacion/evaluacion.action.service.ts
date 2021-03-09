import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { EvaluacionComentarioFragment } from '../evaluacion-formulario/evaluacion-comentarios/evaluacion-comentarios.fragment';
import { EvaluacionDocumentacionFragment } from '../evaluacion-formulario/evaluacion-documentacion/evaluacion-documentacion.fragment';
import { EvaluacionEvaluacionFragment } from '../evaluacion-formulario/evaluacion-evaluacion/evaluacion-evaluacion.fragment';
import { EvaluacionFormularioActionService, Gestion } from '../evaluacion-formulario/evaluacion-formulario.action.service';

@Injectable()
export class EvaluacionActionService extends EvaluacionFormularioActionService {

  constructor(
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
      fb, this.evaluacion?.id, snackBarService, service, personaFisicaService);
    this.comentarios = new EvaluacionComentarioFragment(this.evaluacion?.id, Gestion.GESTOR, service);
    this.documentacion = new EvaluacionDocumentacionFragment(this.evaluacion?.id);


    this.addFragment(this.FRAGMENT.COMENTARIOS, this.comentarios);
    this.addFragment(this.FRAGMENT.EVALUACIONES, this.evaluaciones);
    this.addFragment(this.FRAGMENT.DOCUMENTACION, this.documentacion);
    this.evaluaciones.setComentarios(this.comentarios.comentarios$);
  }

  getGestion(): Gestion {
    return Gestion.GESTOR;
  }
}
