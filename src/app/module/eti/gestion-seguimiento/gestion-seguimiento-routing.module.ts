import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SgiAuthGuard, SgiAuthRoutes } from '@sgi/framework/auth';
import { GestionSeguimientoListadoComponent } from './gestion-seguimiento-listado/gestion-seguimiento-listado.component';
import { GestionSeguimientoEvaluarComponent } from './gestion-seguimiento-evaluar/gestion-seguimiento-evaluar.component';
import { ActionGuard } from '@core/guards/master-form.guard';
import { GestionSeguimientoResolver } from './gestion-seguimiento.resolver';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { GESTION_SEGUIMIENTO_ROUTE_NAMES } from './gestion-seguimiento-route-names';
import { SeguimientoEvaluacionComponent } from '../seguimiento-formulario/seguimiento-evaluacion/seguimiento-evaluacion.component';
import { SeguimientoComentariosComponent } from '../seguimiento-formulario/seguimiento-comentarios/seguimiento-comentarios.component';
import { SeguimientoDocumentacionComponent } from '../seguimiento-formulario/seguimiento-documentacion/seguimiento-documentacion.component';

const MSG_LISTADO_TITLE = marker('eti.gestionSeguimiento.listado.titulo');
const MSG_GESTION_SEGUIMIENTO_EVALUAR_TITLE = marker('eti.gestionSeguimiento.evaluar.titulo');

const routes: SgiAuthRoutes = [
  {
    path: '',
    pathMatch: 'full',
    component: GestionSeguimientoListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-EVC-V']
    }
  },
  {
    path: `:id`,
    component: GestionSeguimientoEvaluarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      evaluacion: GestionSeguimientoResolver
    },
    data: {
      title: MSG_GESTION_SEGUIMIENTO_EVALUAR_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-EVC-EVAL']
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: GESTION_SEGUIMIENTO_ROUTE_NAMES.EVALUACIONES
      },
      {
        path: GESTION_SEGUIMIENTO_ROUTE_NAMES.EVALUACIONES,
        component: SeguimientoEvaluacionComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: GESTION_SEGUIMIENTO_ROUTE_NAMES.COMENTARIOS,
        component: SeguimientoComentariosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: GESTION_SEGUIMIENTO_ROUTE_NAMES.DOCUMENTACION,
        component: SeguimientoDocumentacionComponent,
        canDeactivate: [FragmentGuard]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionSeguimientoRoutingModule {
}
