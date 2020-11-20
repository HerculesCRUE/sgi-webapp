import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EvaluadorListadoComponent } from './evaluador-listado/evaluador-listado.component';
import { EvaluadorCrearComponent } from './evaluador-crear/evaluador-crear.component';
import { EvaluadorEditarComponent } from './evaluador-editar/evaluador-editar.component';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ROUTE_NAMES } from '@core/route.names';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRoutes } from '@core/route';
import { ActionGuard } from '@core/guards/master-form.guard';
import { EVALUADOR_ROUTE_NAMES } from './evaluador-route-names';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { EvaluadorDatosGeneralesComponent } from './evaluador-formulario/evaluador-datos-generales/evaluador-datos-generales.component';
import { EvaluadorResolver } from './evaluador.resolver';
import { EvaluadorConflictosInteresListadoComponent } from './evaluador-formulario/evaluador-conflictos-interes/evaluador-conflictos-interes-listado/evaluador-conflictos-interes-listado.component';

const MSG_LISTADO_TITLE = marker('eti.evaluador.listado.titulo');
const MSG_NEW_TITLE = marker('eti.evaluador.crear.titulo');
const MSG_EDIT_TITLE = marker('eti.evaluador.actualizar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: EvaluadorListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      hasAuthorityForAnyUO: 'ETI-EVR-V'
    }
  },
  {
    path: ROUTE_NAMES.NEW,
    component: EvaluadorCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
      hasAuthorityForAnyUO: 'ETI-EVR-C'
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: EVALUADOR_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: EVALUADOR_ROUTE_NAMES.DATOS_GENERALES,
        component: EvaluadorDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: EVALUADOR_ROUTE_NAMES.CONFLICTOS_INTERES,
        component: EvaluadorConflictosInteresListadoComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: EvaluadorEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      evaluador: EvaluadorResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
      hasAuthorityForAnyUO: 'ETI-EVR-E'
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: EVALUADOR_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: EVALUADOR_ROUTE_NAMES.DATOS_GENERALES,
        component: EvaluadorDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: EVALUADOR_ROUTE_NAMES.CONFLICTOS_INTERES,
        component: EvaluadorConflictosInteresListadoComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvaluadorRoutingModule {
}
