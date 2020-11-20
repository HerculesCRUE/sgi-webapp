import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiAuthGuard, SgiAuthRoutes } from '@sgi/framework/auth';

import { EvaluacionEvaluarComponent } from './evaluacion-evaluar/evaluacion-evaluar.component';
import { EvaluacionListadoComponent } from './evaluacion-listado/evaluacion-listado.component';
import { ActionGuard } from '@core/guards/master-form.guard';
import { EVALUACION_ROUTE_NAMES } from './evaluacion-route-names';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { EvaluacionResolver } from './evaluacion.resolver';
import { EvaluacionEvaluacionComponent } from '../evaluacion-formulario/evaluacion-evaluacion/evaluacion-evaluacion.component';
import { EvaluacionComentariosComponent } from '../evaluacion-formulario/evaluacion-comentarios/evaluacion-comentarios.component';
import { EvaluacionDocumentacionComponent } from '../evaluacion-formulario/evaluacion-documentacion/evaluacion-documentacion.component';

const MSG_EVALUACION_LISTADO_TITLE = marker('eti.evaluacion.listado.titulo');
const MSG_EVALUACION_EVALUAR_TITLE = marker('eti.evaluacion.evaluar.titulo');

const routes: SgiAuthRoutes = [
  {
    path: '',
    component: EvaluacionListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_EVALUACION_LISTADO_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-EVC-V']
    }
  },
  {
    path: `:id`,
    component: EvaluacionEvaluarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      evaluacion: EvaluacionResolver
    },
    data: {
      title: MSG_EVALUACION_EVALUAR_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-EVC-EVAL']
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: EVALUACION_ROUTE_NAMES.EVALUACIONES
      },
      {
        path: EVALUACION_ROUTE_NAMES.EVALUACIONES,
        component: EvaluacionEvaluacionComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: EVALUACION_ROUTE_NAMES.COMENTARIOS,
        component: EvaluacionComentariosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: EVALUACION_ROUTE_NAMES.DOCUMENTACION,
        component: EvaluacionDocumentacionComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvaluacionRoutingModule {
}
