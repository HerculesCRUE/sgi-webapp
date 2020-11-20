import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PeticionEvaluacionListadoGesComponent } from './peticion-evaluacion-listado-ges/peticion-evaluacion-listado-ges.component';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRoutes } from '@core/route';
import { PeticionEvaluacionEditarComponent } from './peticion-evaluacion-editar/peticion-evaluacion-editar.component';
import { PeticionEvaluacionResolver } from './peticion-evaluacion.resolver';
import { ActionGuard } from '@core/guards/master-form.guard';
import { PETICION_EVALUACION_ROUTE_NAMES } from './peticion-evaluacion-route-names';
import { PeticionEvaluacionDatosGeneralesComponent } from './peticion-evaluacion-formulario/peticion-evaluacion-datos-generales/peticion-evaluacion-datos-generales.component';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { EquipoInvestigadorListadoComponent } from './peticion-evaluacion-formulario/equipo-investigador/equipo-investigador-listado/equipo-investigador-listado.component';
import { PeticionEvaluacionTareasListadoComponent } from './peticion-evaluacion-formulario/peticion-evaluacion-tareas/peticion-evaluacion-tareas-listado/peticion-evaluacion-tareas-listado.component';
import { MemoriasListadoComponent } from './peticion-evaluacion-formulario/memorias-listado/memorias-listado.component';

const MSG_LISTADO_TITLE = marker('eti.peticionEvaluacion.listado.titulo');
const MSG_EDIT_TITLE = marker('eti.peticionEvaluacion.actualizar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: PeticionEvaluacionListadoGesComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      hasAuthorityForAnyUO: 'ETI-PEV-V'
    }
  },
  {
    path: `:id`,
    component: PeticionEvaluacionEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      peticionEvaluacion: PeticionEvaluacionResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
      hasAuthorityForAnyUO: 'ETI-PEV-V',
      readonly: true
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PETICION_EVALUACION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PETICION_EVALUACION_ROUTE_NAMES.DATOS_GENERALES,
        component: PeticionEvaluacionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PETICION_EVALUACION_ROUTE_NAMES.EQUIPO_INVESTIGADOR,
        component: EquipoInvestigadorListadoComponent
      },
      {
        path: PETICION_EVALUACION_ROUTE_NAMES.TAREAS,
        component: PeticionEvaluacionTareasListadoComponent
      },
      {
        path: PETICION_EVALUACION_ROUTE_NAMES.MEMORIAS,
        component: MemoriasListadoComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeticionEvaluacionGesRoutingModule {
}
