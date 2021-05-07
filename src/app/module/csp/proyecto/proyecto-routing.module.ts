import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { MSG_PARAMS } from '@core/i18n';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard, SgiAuthRoutes } from '@sgi/framework/auth';
import { ProyectoCrearComponent } from './proyecto-crear/proyecto-crear.component';
import { ProyectoDataResolver, PROYECTO_DATA_KEY } from './proyecto-data.resolver';
import { ProyectoEditarComponent } from './proyecto-editar/proyecto-editar.component';
import { ProyectoContextoComponent } from './proyecto-formulario/proyecto-contexto/proyecto-contexto.component';
import { ProyectoFichaGeneralComponent } from './proyecto-formulario/proyecto-datos-generales/proyecto-ficha-general.component';
import { ProyectoDocumentosComponent } from './proyecto-formulario/proyecto-documentos/proyecto-documentos.component';
import { ProyectoEntidadGestoraComponent } from './proyecto-formulario/proyecto-entidad-gestora/proyecto-entidad-gestora.component';
import { ProyectoEntidadesConvocantesComponent } from './proyecto-formulario/proyecto-entidades-convocantes/proyecto-entidades-convocantes.component';
import { ProyectoEntidadesFinanciadorasComponent } from './proyecto-formulario/proyecto-entidades-financiadoras/proyecto-entidades-financiadoras.component';
import { ProyectoEquipoComponent } from './proyecto-formulario/proyecto-equipo/proyecto-equipo.component';
import { ProyectoHistoricoEstadosComponent } from './proyecto-formulario/proyecto-historico-estados/proyecto-historico-estados.component';
import { ProyectoHitosComponent } from './proyecto-formulario/proyecto-hitos/proyecto-hitos.component';
import { ProyectoPaqueteTrabajoComponent } from './proyecto-formulario/proyecto-paquete-trabajo/proyecto-paquete-trabajo.component';
import { ProyectoPeriodoSeguimientosComponent } from './proyecto-formulario/proyecto-periodo-seguimientos/proyecto-periodo-seguimientos.component';
import { ProyectoPlazosComponent } from './proyecto-formulario/proyecto-plazos/proyecto-plazos.component';
import { ProyectoProrrogasComponent } from './proyecto-formulario/proyecto-prorrogas/proyecto-prorrogas.component';
import { ProyectoSociosComponent } from './proyecto-formulario/proyecto-socios/proyecto-socios.component';
import { ProyectoListadoComponent } from './proyecto-listado/proyecto-listado.component';
import { PROYECTO_ROUTE_NAMES } from './proyecto-route-names';
import { PROYECTO_ROUTE_PARAMS } from './proyecto-route-params';

const PROYECTO_KEY = marker('csp.proyecto');
const PROYECTO_SOCIOS_KEY = marker('menu.csp.proyectos.socios');
const PROYECTO_PERIODOS_SEGUIMIENTO_KEY = marker('menu.csp.proyectos.seguimientos-cientificos');
const PROYECTO_PRORROGA_KEY = marker('menu.csp.proyectos.prorrogas');
const MSG_NEW_TITLE = marker('title.new.entity');

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
      title: MSG_NEW_TITLE,
      titleParams: {
        entity: PROYECTO_KEY, ...MSG_PARAMS.GENDER.MALE, ...MSG_PARAMS.CARDINALIRY.SINGULAR
      }
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
    path: `:${PROYECTO_ROUTE_PARAMS.ID}`,
    component: ProyectoEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      [PROYECTO_DATA_KEY]: ProyectoDataResolver
    },
    data: {
      title: PROYECTO_KEY,
      titleParams: MSG_PARAMS.CARDINALIRY.SINGULAR
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
        path: PROYECTO_ROUTE_NAMES.FASES,
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
  },
  {
    path: `:${PROYECTO_ROUTE_PARAMS.ID}`,
    canActivate: [SgiAuthGuard],
    data: {
      title: PROYECTO_KEY,
      titleParams: MSG_PARAMS.CARDINALIRY.SINGULAR
    },
    resolve: {
      [PROYECTO_DATA_KEY]: ProyectoDataResolver
    },
    children: [
      {
        path: PROYECTO_ROUTE_NAMES.SOCIOS,
        loadChildren: () =>
          import('../proyecto-socio/proyecto-socio.module').then(
            (m) => m.ProyectoSocioModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: PROYECTO_SOCIOS_KEY
        }
      },
      {
        path: PROYECTO_ROUTE_NAMES.SEGUIMIENTO_CIENTIFICO,
        loadChildren: () =>
          import('../proyecto-periodo-seguimiento/proyecto-periodo-seguimiento.module').then(
            (m) => m.ProyectoPeriodoSeguimientoModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: PROYECTO_PERIODOS_SEGUIMIENTO_KEY
        }
      },
      {
        path: PROYECTO_ROUTE_NAMES.PRORROGAS,
        loadChildren: () =>
          import('../proyecto-prorroga/proyecto-prorroga.module').then(
            (m) => m.ProyectoProrrogaModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: PROYECTO_PRORROGA_KEY
        }
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
