import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ProyectoProrrogaCrearComponent } from './proyecto-prorroga-crear/proyecto-prorroga-crear.component';
import { ProyectoProrrogaEditarComponent } from './proyecto-prorroga-editar/proyecto-prorroga-editar.component';
import { ProyectoProrrogaDatosGeneralesComponent } from './proyecto-prorroga-formulario/proyecto-prorroga-datos-generales/proyecto-prorroga-datos-generales.component';
import { ProyectoProrrogaDocumentosComponent } from './proyecto-prorroga-formulario/proyecto-prorroga-documentos/proyecto-prorroga-documentos.component';
import { PROYECTO_PRORROGA_ROUTE_NAMES } from './proyecto-prorroga-route-names';
import { ProyectoProrrogaGuard } from './proyecto-prorroga.guard';


const MSG_NEW_TITLE = marker('csp.proyecto-prorroga.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.proyecto-prorroga.editar.titulo');

const routes: SgiRoutes = [
  {
    path: `${ROUTE_NAMES.NEW}`,
    component: ProyectoProrrogaCrearComponent,
    canActivate: [SgiAuthGuard, ProyectoProrrogaGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_PRORROGA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PROYECTO_PRORROGA_ROUTE_NAMES.DATOS_GENERALES,
        component: ProyectoProrrogaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_PRORROGA_ROUTE_NAMES.DOCUMENTOS,
        component: ProyectoProrrogaDocumentosComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: ProyectoProrrogaEditarComponent,
    canActivate: [SgiAuthGuard, ProyectoProrrogaGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_EDIT_TITLE
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_PRORROGA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PROYECTO_PRORROGA_ROUTE_NAMES.DATOS_GENERALES,
        component: ProyectoProrrogaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_PRORROGA_ROUTE_NAMES.DOCUMENTOS,
        component: ProyectoProrrogaDocumentosComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProyectoProrrogaRouting {
}
