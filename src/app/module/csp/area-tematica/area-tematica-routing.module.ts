import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { AreaTematicaCrearComponent } from './area-tematica-crear/area-tematica-crear.component';
import { AreaTematicaEditarComponent } from './area-tematica-editar/area-tematica-editar.component';
import { AreaTematicaArbolComponent } from './area-tematica-formulario/area-tematica-arbol/area-tematica-arbol.component';
import { AreaTematicaDatosGeneralesComponent } from './area-tematica-formulario/area-tematica-datos-generales/area-tematica-datos-generales.component';
import { AreaTematicaListadoComponent } from './area-tematica-listado/area-tematica-listado.component';
import { AREA_TEMATICA_ROUTE_NAMES } from './area-tematica-route-names';
import { AreaTematicaResolver } from './area-tematica.resolver';

const MSG_LISTADO_TITLE = marker('csp.area.tematica.listado.titulo');
const MSG_NEW_TITLE = marker('csp.area.tematica.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.area.tematica.editar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: AreaTematicaListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE
    },
  },
  {
    path: ROUTE_NAMES.NEW,
    component: AreaTematicaCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: AREA_TEMATICA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: AREA_TEMATICA_ROUTE_NAMES.DATOS_GENERALES,
        component: AreaTematicaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: AREA_TEMATICA_ROUTE_NAMES.AREAS_ARBOL,
        component: AreaTematicaArbolComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  },
  {
    path: `:id`,
    component: AreaTematicaEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      area: AreaTematicaResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: AREA_TEMATICA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: AREA_TEMATICA_ROUTE_NAMES.DATOS_GENERALES,
        component: AreaTematicaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: AREA_TEMATICA_ROUTE_NAMES.AREAS_ARBOL,
        component: AreaTematicaArbolComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AreaTematicaRoutingModule {
}
