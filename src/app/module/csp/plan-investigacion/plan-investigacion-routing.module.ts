import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { PlanInvestigacionCrearComponent } from './plan-investigacion-crear/plan-investigacion-crear.component';
import { PlanInvestigacionEditarComponent } from './plan-investigacion-editar/plan-investigacion-editar.component';
import { PlanInvestigacionDatosGeneralesComponent } from './plan-investigacion-formulario/plan-investigacion-datos-generales/plan-investigacion-datos-generales.component';
import { PlanInvestigacionProgramasComponent } from './plan-investigacion-formulario/plan-investigacion-programas/plan-investigacion-programas.component';
import { PlanInvestigacionListadoComponent } from './plan-investigacion-listado/plan-investigacion-listado.component';
import { PLAN_INVESTIGACION_ROUTE_NAMES } from './plan-investigacion-route-names';
import { PlanInvestigacionResolver } from './plan-investigacion.resolver';

const MSG_LISTADO_TITLE = marker('csp.plan.investigacion.listado.titulo');
const MSG_NEW_TITLE = marker('csp.plan.investigacion.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.plan.investigacion.editar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: PlanInvestigacionListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE
    },
  },
  {
    path: ROUTE_NAMES.NEW,
    component: PlanInvestigacionCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PLAN_INVESTIGACION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PLAN_INVESTIGACION_ROUTE_NAMES.DATOS_GENERALES,
        component: PlanInvestigacionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PLAN_INVESTIGACION_ROUTE_NAMES.PROGRAMAS,
        component: PlanInvestigacionProgramasComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  },
  {
    path: `:id`,
    component: PlanInvestigacionEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      plan: PlanInvestigacionResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PLAN_INVESTIGACION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PLAN_INVESTIGACION_ROUTE_NAMES.DATOS_GENERALES,
        component: PlanInvestigacionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PLAN_INVESTIGACION_ROUTE_NAMES.PROGRAMAS,
        component: PlanInvestigacionProgramasComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanInvestigacionRoutingModule {
}
