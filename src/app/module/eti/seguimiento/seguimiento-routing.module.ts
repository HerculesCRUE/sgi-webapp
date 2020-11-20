import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiAuthGuard, SgiAuthRoutes } from '@sgi/framework/auth';
import { SeguimientoEvaluarComponent } from './seguimiento-evaluar/seguimiento-evaluar.component';

import { SeguimientoListadoComponent } from './seguimiento-listado/seguimiento-listado.component';
import { SEGUIMIENTO_ROUTE_NAMES } from './seguimiento-route-names';
import { SeguimientoResolver } from './seguimiento.resolver';
import { SeguimientoComentariosComponent } from '../seguimiento-formulario/seguimiento-comentarios/seguimiento-comentarios.component';
import { SeguimientoDatosMemoriaComponent } from '../seguimiento-formulario/seguimiento-datos-memoria/seguimiento-datos-memoria.component';
import { SeguimientoDocumentacionComponent } from '../seguimiento-formulario/seguimiento-documentacion/seguimiento-documentacion.component';

const MSG_LISTADO_TITLE = marker('eti.seguimiento.listado.titulo');
const MSG_EVALUAR_TITLE = marker('eti.seguimiento.evaluar.titulo');

const routes: SgiAuthRoutes = [
  {
    path: '',
    component: SeguimientoListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-EVC-V', 'ETI-EVC-VR', 'ETI-EVC-VR-INV']
    }
  },
  {
    path: ':id',
    component: SeguimientoEvaluarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      evaluacion: SeguimientoResolver
    },
    data: {
      title: MSG_EVALUAR_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-EVC-EVAL', 'ETI-EVC-EVALR', 'ETI-EVC-EVALR-INV']
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: SEGUIMIENTO_ROUTE_NAMES.MEMORIA
      },
      {
        path: SEGUIMIENTO_ROUTE_NAMES.COMENTARIOS,
        component: SeguimientoComentariosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SEGUIMIENTO_ROUTE_NAMES.MEMORIA,
        component: SeguimientoDatosMemoriaComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SEGUIMIENTO_ROUTE_NAMES.DOCUMENTACION,
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
export class SeguimientoRoutingModule {
}
