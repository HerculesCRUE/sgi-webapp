import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import {
  EquipoInvestigadorListadoComponent
} from '../peticion-evaluacion-formulario/equipo-investigador/equipo-investigador-listado/equipo-investigador-listado.component';
import {
  PeticionEvaluacionDatosGeneralesComponent
} from '../peticion-evaluacion-formulario/peticion-evaluacion-datos-generales/peticion-evaluacion-datos-generales.component';
import { PETICION_EVALUACION_ROUTE_NAMES } from '../peticion-evaluacion-route-names';
import { PeticionEvaluacionActionService } from '../peticion-evaluacion.action.service';





const MSG_BUTTON_SAVE = marker('botones.guardar');
const MSG_ERROR = marker('eti.peticionEvaluacion.crear.error');
const MSG_SUCCESS = marker('eti.peticionEvaluacion.crear.correcto');

@Component({
  selector: 'sgi-peticion-evaluacion-crear',
  templateUrl: './peticion-evaluacion-crear.component.html',
  styleUrls: ['./peticion-evaluacion-crear.component.scss'],
  viewProviders: [
    PeticionEvaluacionActionService
  ]
})
export class PeticionEvaluacionCrearComponent extends ActionComponent {

  PETICION_EVALUACION_ROUTE_NAMES = PETICION_EVALUACION_ROUTE_NAMES;

  @ViewChild('datosGenerales', { static: true }) datosGenerales: PeticionEvaluacionDatosGeneralesComponent;
  @ViewChild('equipoInvestigadorListado', { static: true }) equipoInvestigadorListado: EquipoInvestigadorListadoComponent;

  textoCrear = MSG_BUTTON_SAVE;


  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public readonly actionService: PeticionEvaluacionActionService,
    dialogService: DialogService
  ) {
    super(router, route, actionService, dialogService);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }

}
