import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { SeguimientoEvaluacionFragment } from '../seguimiento-formulario/seguimiento-evaluacion/seguimiento-evaluacion.fragment';
import { SeguimientoFormularioActionService, Gestion } from '../seguimiento-formulario/seguimiento-formulario.action.service';
import { SeguimientoComentarioFragment } from '../seguimiento-formulario/seguimiento-comentarios/seguimiento-comentarios.fragment';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SeguimientoDocumentacionFragment } from '../seguimiento-formulario/seguimiento-documentacion/seguimiento-documentacion.fragment';

@Injectable()
export class GestionSeguimientoActionService extends SeguimientoFormularioActionService {


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
    this.evaluaciones = new SeguimientoEvaluacionFragment(
      logger, fb, this.evaluacion?.id, snackBarService, service, personaFisicaService);
    this.comentarios = new SeguimientoComentarioFragment(this.logger, this.evaluacion?.id, Gestion.GESTOR, service);
    this.documentacion = new SeguimientoDocumentacionFragment(this.logger, this.evaluacion?.id);

    this.addFragment(this.FRAGMENT.COMENTARIOS, this.comentarios);
    this.addFragment(this.FRAGMENT.EVALUACIONES, this.evaluaciones);
    this.addFragment(this.FRAGMENT.DOCUMENTACION, this.documentacion);
    this.evaluaciones.setComentarios(this.comentarios.comentarios$);


  }

  getEvaluacion(): IEvaluacion {
    this.logger.debug(SeguimientoEvaluacionFragment.name, 'getEvaluacion()', 'start');
    this.logger.debug(SeguimientoEvaluacionFragment.name, 'getEvaluacion()', 'end');
    return this.evaluacion;
  }

  getGestion(): Gestion {
    return Gestion.GESTOR;
  }
}
