import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ModeloEjecucionCrearComponent } from './modelo-ejecucion-crear/modelo-ejecucion-crear.component';
import { ModeloEjecucionEditarComponent } from './modelo-ejecucion-editar/modelo-ejecucion-editar.component';
import { ModeloEjecucionDatosGeneralesComponent } from './modelo-ejecucion-formulario/modelo-ejecucion-datos-generales/modelo-ejecucion-datos-generales.component';
import { ModeloEjecucionTipoDocumentoComponent } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-documento/modelo-ejecucion-tipo-documento.component';
import { ModeloEjecucionTipoEnlaceComponent } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-enlace/modelo-ejecucion-tipo-enlace.component';
import { ModeloEjecucionTipoFinalidadComponent } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-finalidad/modelo-ejecucion-tipo-finalidad.component';
import { ModeloEjecucionTipoFaseComponent } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-fase/modelo-ejecucion-tipo-fase.component';
import { ModeloEjecucionListadoComponent } from './modelo-ejecucion-listado/modelo-ejecucion-listado.component';
import { MODELO_EJECUCION_ROUTE_NAMES } from './modelo-ejecucion-route-names';
import { ModeloEjecucionResolver } from './modelo-ejecucion.resolver';
import { ModeloEjecucionTipoHitoComponent } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-hito/modelo-ejecucion-tipo-hito.component';
import { ModeloEjecucionTipoUnidadGestionComponent } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-unidad-gestion/modelo-ejecucion-tipo-unidad-gestion.component';

const MSG_LISTADO_TITLE = marker('csp.modelo.ejecucion.listado.titulo');
const MSG_NEW_TITLE = marker('csp.modelo.ejecucion.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.modelo.ejecucion.editar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: ModeloEjecucionListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE
    },
  },
  {
    path: ROUTE_NAMES.NEW,
    component: ModeloEjecucionCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: MODELO_EJECUCION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.DATOS_GENERALES,
        component: ModeloEjecucionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_ENLACES,
        component: ModeloEjecucionTipoEnlaceComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_FINALIDADES,
        component: ModeloEjecucionTipoFinalidadComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_FASES,
        component: ModeloEjecucionTipoFaseComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_DOCUMENTOS,
        component: ModeloEjecucionTipoDocumentoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_HITOS,
        component: ModeloEjecucionTipoHitoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.UNIDAD_GESTION,
        component: ModeloEjecucionTipoUnidadGestionComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  },
  {
    path: `:id`,
    component: ModeloEjecucionEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      modeloEjecucion: ModeloEjecucionResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: MODELO_EJECUCION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.DATOS_GENERALES,
        component: ModeloEjecucionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_ENLACES,
        component: ModeloEjecucionTipoEnlaceComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_FINALIDADES,
        component: ModeloEjecucionTipoFinalidadComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_FASES,
        component: ModeloEjecucionTipoFaseComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_DOCUMENTOS,
        component: ModeloEjecucionTipoDocumentoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.TIPO_HITOS,
        component: ModeloEjecucionTipoHitoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: MODELO_EJECUCION_ROUTE_NAMES.UNIDAD_GESTION,
        component: ModeloEjecucionTipoUnidadGestionComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModeloEjecuccionRoutingModule {
}
