import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PeticionEvaluacionListadoInvComponent } from './peticion-evaluacion-listado-inv/peticion-evaluacion-listado-inv.component';
import { PeticionEvaluacionTareasListadoComponent } from './peticion-evaluacion-formulario/peticion-evaluacion-tareas/peticion-evaluacion-tareas-listado/peticion-evaluacion-tareas-listado.component';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ROUTE_NAMES } from '@core/route.names';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRoutes } from '@core/route';
import { PeticionEvaluacionCrearComponent } from './peticion-evaluacion-crear/peticion-evaluacion-crear.component';
import { PETICION_EVALUACION_ROUTE_NAMES } from './peticion-evaluacion-route-names';
import { ActionGuard } from '@core/guards/master-form.guard';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { PeticionEvaluacionDatosGeneralesComponent } from './peticion-evaluacion-formulario/peticion-evaluacion-datos-generales/peticion-evaluacion-datos-generales.component';
import { MemoriasListadoComponent } from './peticion-evaluacion-formulario/memorias-listado/memorias-listado.component';
import { EquipoInvestigadorListadoComponent } from './peticion-evaluacion-formulario/equipo-investigador/equipo-investigador-listado/equipo-investigador-listado.component';

import { PeticionEvaluacionResolver } from './peticion-evaluacion.resolver';
import { PeticionEvaluacionEditarComponent } from './peticion-evaluacion-editar/peticion-evaluacion-editar.component';

const MSG_LISTADO_TITLE = marker('eti.peticionEvaluacion.listado.titulo');
const MSG_LISTADO_TAREAS_TITLE = marker('eti.peticionEvaluacion.tareas.listado.titulo');
const MSG_NEW_TITLE = marker('eti.peticionEvaluacion.crear.titulo');
const MSG_EDIT_TITLE = marker('eti.peticionEvaluacion.actualizar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: PeticionEvaluacionListadoInvComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      hasAuthorityForAnyUO: 'ETI-PEV-VR-INV'
    },

  },
  {
    path: ROUTE_NAMES.NEW,
    component: PeticionEvaluacionCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-PEV-C-INV']
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
      hasAuthorityForAnyUO: 'ETI-PEV-ER-INV'
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
export class PeticionEvaluacionInvRoutingModule {
}
