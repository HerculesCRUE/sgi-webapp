import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiAuthGuard, SgiAuthRoutes } from '@sgi/framework/auth';
import { ProyectoListadoComponent } from './proyecto-listado/proyecto-listado.component';
import { ProyectoEditarComponent } from './proyecto-editar/proyecto-editar.component';
import { PROYECTO_ROUTE_NAMES } from './proyecto-route-names';
import { ROUTE_NAMES } from '@core/route.names';
import { ProyectoCrearComponent } from './proyecto-crear/proyecto-crear.component';
import { ActionGuard } from '@core/guards/master-form.guard';
import { ProyectoResolver } from './proyecto.resolver';
import { ProyectoFichaGeneralComponent } from './proyecto-formulario/proyecto-datos-generales/proyecto-ficha-general.component';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ProyectoEntidadesFinanciadorasComponent } from './proyecto-formulario/proyecto-entidades-financiadoras/proyecto-entidades-financiadoras.component';
import { ProyectoHitosComponent } from './proyecto-formulario/proyecto-hitos/proyecto-hitos.component';
import { ProyectoSociosComponent } from './proyecto-formulario/proyecto-socios/proyecto-socios.component';
import { ProyectoEntidadesConvocantesComponent } from './proyecto-formulario/proyecto-entidades-convocantes/proyecto-entidades-convocantes.component';
import { ProyectoPaqueteTrabajoComponent } from './proyecto-formulario/proyecto-paquete-trabajo/proyecto-paquete-trabajo.component';
import { ProyectoPlazosComponent } from './proyecto-formulario/proyecto-plazos/proyecto-plazos.component';
import { ProyectoContextoComponent } from './proyecto-formulario/proyecto-contexto/proyecto-contexto.component';
import { ProyectoPeriodoSeguimientosComponent } from './proyecto-formulario/proyecto-periodo-seguimientos/proyecto-periodo-seguimientos.component';
import { ProyectoEntidadGestoraComponent } from './proyecto-formulario/proyecto-entidad-gestora/proyecto-entidad-gestora.component';
import { ProyectoEquipoComponent } from './proyecto-formulario/proyecto-equipo/proyecto-equipo.component';
import { ProyectoProrrogasComponent } from './proyecto-formulario/proyecto-prorrogas/proyecto-prorrogas.component';
import { ProyectoDocumentosComponent } from './proyecto-formulario/proyecto-documentos/proyecto-documentos.component';
import { ProyectoHistoricoEstadosComponent } from './proyecto-formulario/proyecto-historico-estados/proyecto-historico-estados.component';
import { MSG_PARAMS } from '@core/i18n';

const PROYECTO_KEY = marker('csp.proyecto');
const MSG_EDIT_TITLE = marker('csp.proyecto.editar.titulo');
const MSG_NEW_TITLE = marker('csp.proyecto.crear.titulo');

const routes: SgiAuthRoutes = [
  {
    path: '',
    component: ProyectoListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: PROYECTO_KEY,
      titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
    }
  },
  {
    path: ROUTE_NAMES.NEW,
    component: ProyectoCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_ROUTE_NAMES.FICHA_GENERAL
      },
      {
        path: PROYECTO_ROUTE_NAMES.FICHA_GENERAL,
        component: ProyectoFichaGeneralComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: ProyectoEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      proyecto: ProyectoResolver
    },
    data: {
      title: MSG_EDIT_TITLE
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_ROUTE_NAMES.FICHA_GENERAL
      },
      {
        path: PROYECTO_ROUTE_NAMES.FICHA_GENERAL,
        component: ProyectoFichaGeneralComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.ENTIDADES_FINANCIADORAS,
        component: ProyectoEntidadesFinanciadorasComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.HITOS,
        component: ProyectoHitosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.SOCIOS,
        component: ProyectoSociosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.ENTIDADES_CONVOCANTES,
        component: ProyectoEntidadesConvocantesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.PAQUETE_TRABAJO,
        component: ProyectoPaqueteTrabajoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.PLAZOS,
        component: ProyectoPlazosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.CONTEXTO_PROYECTO,
        component: ProyectoContextoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.SEGUIMIENTO_CIENTIFICO,
        component: ProyectoPeriodoSeguimientosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.ENTIDAD_GESTORA,
        component: ProyectoEntidadGestoraComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.EQUIPO_PROYECTO,
        component: ProyectoEquipoComponent,
      },
      {
        path: PROYECTO_ROUTE_NAMES.DOCUMENTOS,
        component: ProyectoDocumentosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.PRORROGAS,
        component: ProyectoProrrogasComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_ROUTE_NAMES.HISTORICO_ESTADOS,
        component: ProyectoHistoricoEstadosComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProyectoRoutingModule {
}
