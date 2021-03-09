import { SgiRoutes } from '@core/route';
import { ActionGuard } from '@core/guards/master-form.guard';
import { MemoriaResolver } from './memoria.resolver';
import { MEMORIA_ROUTE_NAMES } from './memoria-route-names';
import { MemoriaDatosGeneralesComponent } from './memoria-formulario/memoria-datos-generales/memoria-datos-generales.component';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { MemoriaEditarComponent } from './memoria-editar/memoria-editar.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTE_NAMES } from '@core/route.names';
import { MemoriaCrearComponent } from './memoria-crear/memoria-crear.component';
import { MemoriaCrearGuard } from './memoria-crear/memoria-crear.guard';
import { MemoriaListadoGesComponent } from './memoria-listado-ges/memoria-listado-ges.component';
import { MemoriaDocumentacionComponent } from './memoria-formulario/memoria-documentacion/memoria-documentacion.component';
import { MemoriaEvaluacionesComponent } from './memoria-formulario/memoria-evaluaciones/memoria-evaluaciones.component';
import { MemoriaFormularioComponent } from './memoria-formulario/memoria-formulario/memoria-formulario.component';
import { MemoriaListadoInvComponent } from './memoria-listado-inv/memoria-listado-inv.component';
import { MemoriaInformesComponent } from './memoria-formulario/memoria-informes/memoria-informes.component';

const MSG_LISTADO_TITLE = marker('eti.memoria.listado.titulo');
const MSG_NEW_TITLE = marker('eti.memoria.crear.titulo');
const MSG_EDIT_TITLE = marker('eti.memoria.editar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: MemoriaListadoInvComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      hasAuthorityForAnyUO: 'ETI-PEV-VR-INV'
    }
  },
  {
    path: ROUTE_NAMES.NEW,
    component: MemoriaCrearComponent,
    canActivate: [SgiAuthGuard, MemoriaCrearGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
      hasAnyAuthorityForAnyUO: ['ETI-PEV-C-INV', 'ETI-PEV-ER-INV']
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: MEMORIA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: MEMORIA_ROUTE_NAMES.DATOS_GENERALES,
        component: MemoriaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: MemoriaEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      memoria: MemoriaResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
      hasAuthorityForAnyUO: 'ETI-PEV-ER-INV',
      readonly: false
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: MEMORIA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: MEMORIA_ROUTE_NAMES.DATOS_GENERALES,
        component: MemoriaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MEMORIA_ROUTE_NAMES.FORMULARIO,
        component: MemoriaFormularioComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MEMORIA_ROUTE_NAMES.DOCUMENTACION,
        component: MemoriaDocumentacionComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MEMORIA_ROUTE_NAMES.EVALUACIONES,
        component: MemoriaEvaluacionesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MEMORIA_ROUTE_NAMES.VERSIONES,
        component: MemoriaInformesComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoriaRoutingInvModule {
}
