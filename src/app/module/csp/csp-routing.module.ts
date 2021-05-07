import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MSG_PARAMS } from '@core/i18n';
import { SgiRoutes } from '@core/route';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { CspInicioComponent } from './csp-inicio/csp-inicio.component';
import { CspRootComponent } from './csp-root/csp-root.component';
import { CSP_ROUTE_NAMES } from './csp-route-names';

const MSG_ROOT_TITLE = marker('csp.root.title');
const MSG_CONVOCATORIA_TITLE = marker('csp.convocatoria');
const MSG_SOLICITUD_TITLE = marker('csp.solicitud');
const MSG_TIPO_ENLACE_TITLE = marker('csp.tipo-enlace');
const MSG_TIPO_HITO_TITLE = marker('csp.tipo-hito');
const MSG_TIPO_FINALIDAD_TITLE = marker('csp.tipo-finalidad');
const MSG_TIPO_DOCUMENTO_TITLE = marker('csp.tipo-documento');
const MSG_MODELO_EJECUCION_TITLE = marker('menu.csp.configuraciones.modelos-ejecucion');
const MSG_PLAN_INVESTIGACION_TITLE = marker('menu.csp.configuraciones.planes-investigacion');
const MSG_GESTION_CONCEPTO_GASTO_TITLE = marker('menu.csp.configuraciones.conceptos-gasto');
const MSG_TIPO_FINANCIACION_TITLE = marker('menu.csp.configuraciones.tipos-financiacion');
const MSG_FUENTE_FINANCIACION_TITLE = marker('menu.csp.configuraciones.fuentes-financiacion');
const MSG_AREA_TEMATICA_TITLE = marker('menu.csp.configuraciones.areas-tematicas');
const PROYECTO_KEY = marker('csp.proyectos');

const routes: SgiRoutes = [
  {
    path: '',
    component: CspRootComponent,
    data: {
      title: MSG_ROOT_TITLE
    },
    children: [
      {
        path: '',
        component: CspInicioComponent,
        pathMatch: 'full',
        data: {
          title: MSG_ROOT_TITLE
        }
      },
      {
        path: CSP_ROUTE_NAMES.CONVOCATORIA,
        loadChildren: () =>
          import('./convocatoria/convocatoria.module').then(
            (m) => m.ConvocatoriaModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_CONVOCATORIA_TITLE,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }
      },
      {
        path: CSP_ROUTE_NAMES.SOLICITUD,
        loadChildren: () =>
          import('./solicitud/solicitud.module').then(
            (m) => m.SolicitudModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_SOLICITUD_TITLE,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }
      },
      {
        path: CSP_ROUTE_NAMES.PROYECTO,
        loadChildren: () =>
          import('./proyecto/proyecto.module').then(
            (m) => m.ProyectoModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: PROYECTO_KEY,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }
      },
      {
        path: CSP_ROUTE_NAMES.TIPO_DOCUMENTO,
        loadChildren: () =>
          import('./tipo-documento/tipo-documento.module').then(
            (m) => m.TipoDocumentoModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_TIPO_DOCUMENTO_TITLE,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }
      },
      {
        path: CSP_ROUTE_NAMES.TIPO_FINALIDAD,
        loadChildren: () =>
          import('./tipo-finalidad/tipo-finalidad.module').then(
            (m) => m.TipoFinalidadModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_TIPO_FINALIDAD_TITLE,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }
      },
      {
        path: CSP_ROUTE_NAMES.MODELO_EJECUCION,
        loadChildren: () =>
          import('./modelo-ejecucion/modelo-ejecucion.module').then(
            (m) => m.ModeloEjecucionModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_MODELO_EJECUCION_TITLE
        }
      },
      {
        path: CSP_ROUTE_NAMES.TIPO_ENLACE,
        loadChildren: () =>
          import('./tipo-enlace/tipo-enlace.module').then(
            (m) => m.TipoEnlaceModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_TIPO_ENLACE_TITLE,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }

      },
      {
        path: CSP_ROUTE_NAMES.TIPO_HITO,
        loadChildren: () =>
          import('./tipo-hito/tipo-hito.module').then(
            (m) => m.TipoHitoModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_TIPO_HITO_TITLE,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }
      },
      {
        path: CSP_ROUTE_NAMES.TIPO_FASE,
        loadChildren: () =>
          import('./tipo-fase/tipo-fase.module').then(
            (m) => m.TipoFaseModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_CONVOCATORIA_TITLE,
          titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
        }
      },
      {
        path: CSP_ROUTE_NAMES.PLANES_INVESTIGACION,
        loadChildren: () =>
          import('./plan-investigacion/plan-investigacion.module').then(
            (m) => m.PlanInvestigacionModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_PLAN_INVESTIGACION_TITLE
        }
      },
      {
        path: CSP_ROUTE_NAMES.CONCEPTO_GASTO,
        loadChildren: () =>
          import('./concepto-gasto/concepto-gasto.module').then(
            (m) => m.ConceptoGastoModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_GESTION_CONCEPTO_GASTO_TITLE
        }
      },
      {
        path: CSP_ROUTE_NAMES.TIPO_FINANCIACION,
        loadChildren: () =>
          import('./tipo-financiacion/tipo-financiacion.module').then(
            (m) => m.TipoFinanciacionModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_TIPO_FINANCIACION_TITLE
        }
      },
      {
        path: CSP_ROUTE_NAMES.FUENTE_FINANCIACION,
        loadChildren: () =>
          import('./fuente-financiacion/fuente-financiacion.module').then(
            (m) => m.FuenteFinanciacionModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_FUENTE_FINANCIACION_TITLE
        }
      },
      {
        path: CSP_ROUTE_NAMES.AREA_TEMATICA,
        loadChildren: () =>
          import('./area-tematica/area-tematica.module').then(
            (m) => m.AreaTematicaModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_AREA_TEMATICA_TITLE
        }
      },
      { path: '**', component: null }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CspRoutingModule {
}
