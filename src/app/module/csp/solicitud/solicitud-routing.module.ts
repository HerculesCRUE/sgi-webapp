import { SgiRoutes } from '@core/route';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SgiAuthGuard } from '@sgi/framework/auth';

import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { ROUTE_NAMES } from '@core/route.names';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SOLICITUD_ROUTE_NAMES } from './solicitud-route-names';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { SolicitudResolver } from './solicitud.resolver';
import { SolicitudCrearComponent } from './solicitud-crear/solicitud-crear.component';
import { SolicitudEditarComponent } from './solicitud-editar/solicitud-editar.component';
import { SolicitudListadoComponent } from './solicitud-listado/solicitud-listado.component';
import { SolicitudDatosGeneralesComponent } from './solicitud-formulario/solicitud-datos-generales/solicitud-datos-generales.component';
import { SolicitudHitosComponent } from './solicitud-formulario/solicitud-hitos/solicitud-hitos.component';
import { SolicitudHistoricoEstadosComponent } from './solicitud-formulario/solicitud-historico-estados/solicitud-historico-estados.component';
import { SolicitudDocumentosComponent } from './solicitud-formulario/solicitud-documentos/solicitud-documentos.component';
import { SolicitudProyectoFichaGeneralComponent } from './solicitud-formulario/solicitud-proyecto-ficha-general/solicitud-proyecto-ficha-general.component';
import { SolicitudEquipoProyectoComponent } from './solicitud-formulario/solicitud-equipo-proyecto/solicitud-equipo-proyecto.component';
import { SolicitudSociosColaboradoresComponent } from './solicitud-formulario/solicitud-socios-colaboradores/solicitud-socios-colaboradores.component';
import { SolicitudProyectoEntidadesFinanciadorasComponent } from './solicitud-formulario/solicitud-proyecto-entidades-financiadoras/solicitud-proyecto-entidades-financiadoras.component';
import { SolicitudProyectoPresupuestoGlobalComponent } from './solicitud-formulario/solicitud-proyecto-presupuesto-global/solicitud-proyecto-presupuesto-global.component';
import { SolicitudProyectoPresupuestoEntidadesComponent } from './solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.component';


const MSG_EDIT_TITLE = marker('csp.solicitud.editar.titulo');
const MSG_LISTADO_TITLE = marker('csp.solicitud.listado.titulo');
const MSG_NEW_TITLE = marker('csp.solicitud.crear.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: SolicitudListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
    }
  },
  {
    path: ROUTE_NAMES.NEW,
    component: SolicitudCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: SOLICITUD_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: SOLICITUD_ROUTE_NAMES.DATOS_GENERALES,
        component: SolicitudDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: SolicitudEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      solicitud: SolicitudResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: SOLICITUD_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: SOLICITUD_ROUTE_NAMES.DATOS_GENERALES,
        component: SolicitudDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.PROYECTO_DATOS,
        component: SolicitudProyectoFichaGeneralComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.SOCIOS_COLABORADORES,
        component: SolicitudSociosColaboradoresComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.HITOS,
        component: SolicitudHitosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.HISTORICO_ESTADOS,
        component: SolicitudHistoricoEstadosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.DOCUMENTOS,
        component: SolicitudDocumentosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.EQUIPO_PROYECTO,
        component: SolicitudEquipoProyectoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.ENTIDADES_FINANCIADORAS,
        component: SolicitudProyectoEntidadesFinanciadorasComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.DESGLOSE_PRESUPUESTO_GLOBAL,
        component: SolicitudProyectoPresupuestoGlobalComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_ROUTE_NAMES.DESGLOSE_PRESUPUESTO_ENTIDADES,
        component: SolicitudProyectoPresupuestoEntidadesComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitudRoutingModule {
}
