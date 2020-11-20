import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRoutes } from '@core/route';
import { SgiAuthGuard } from '@sgi/framework/auth';

import { EtiRootComponent } from './eti-root/eti-root.component';
import { ETI_ROUTE_NAMES } from './eti-route-names';
import { EtiInicioComponent } from './eti-inicio/eti-inicio.component';

const MSG_ROOT_TITLE = marker('eti.root.title');
const MSG_SOLICITUDES_CONVOCATORIA_TITLE = marker('menu.principal.eti.solicitudesConvocatoria');
const MSG_EVALUACIONES_EVALUADOR_TITLE = marker('menu.principal.eti.evaluacionesEvaluador');
const MSG_EVALUACIONES_TITLE = marker('menu.principal.eti.evaluaciones');
const MSG_ACTAS_TITLE = marker('menu.principal.eti.acta');
const MSG_EVALUADORES_TITLE = marker('menu.principal.eti.evaluador');
const MSG_MEMORIAS_TITLE = marker('menu.principal.eti.memorias');
const MSG_SEGUIMIENTOS_TITLE = marker('menu.principal.eti.seguimientos');
const MSG_PETICIONES_EVALUACION_TITLE = marker('menu.principal.eti.peticionesEvaluacion');
const MSG_GESTION_SEGUIMIENTO_TITLE = marker('menu.principal.eti.gestionSeguimiento');
const MSG_CONFIGURACION_TITLE = marker('menu.principal.eti.configuracion');

const routes: SgiRoutes = [
  {
    path: '',
    component: EtiRootComponent,
    data: {
      title: MSG_ROOT_TITLE
    },
    children: [
      {
        path: '',
        component: EtiInicioComponent,
        pathMatch: 'full',
        data: {
          title: MSG_ROOT_TITLE
        }
      },
      {
        path: ETI_ROUTE_NAMES.SOLICITUDES_CONVOCATORIA,
        loadChildren: () =>
          import('./convocatoria-reunion/convocatoria-reunion.module').then(
            (m) => m.ConvocatoriaReunionModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_SOLICITUDES_CONVOCATORIA_TITLE,
          hasAnyAuthorityForAnyUO: ['ETI-CNV-V', 'ETI-CNV-C', 'ETI-CNV-E', 'ETI-CNV-B', 'ETI-CNV-ENV']
        }
      },
      {
        path: ETI_ROUTE_NAMES.EVALUACIONES_EVALUADOR,
        loadChildren: () =>
          import('./evaluacion-evaluador/evaluacion-evaluador.module').then(
            (m) => m.EvaluacionEvaluadorModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_EVALUACIONES_EVALUADOR_TITLE,
          hasAnyAuthorityForAnyUO: [
            'ETI-EVC-V', 'ETI-EVC-VR', 'ETI-EVC-EVAL', 'ETI-EVC-EVALR'
          ]
        }
      },
      {
        path: ETI_ROUTE_NAMES.EVALUACIONES,
        loadChildren: () =>
          import('./evaluacion/evaluacion.module').then(
            (m) => m.EvaluacionModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_EVALUACIONES_TITLE,
          hasAnyAuthorityForAnyUO: [
            'ETI-EVC-V', 'ETI-EVC-EVAL'
          ]
        }
      },
      {
        path: ETI_ROUTE_NAMES.ACTAS,
        loadChildren: () =>
          import('./acta/acta.module').then(
            (m) => m.ActaModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_ACTAS_TITLE,
          hasAnyAuthorityForAnyUO: ['ETI-ACT-V', 'ETI-ACT-C', 'ETI-ACT-E', 'ETI-ACT-B', 'ETI-ACT-DES', 'ETI-ACT-FIN']
        }
      },
      {
        path: ETI_ROUTE_NAMES.EVALUADORES,
        loadChildren: () =>
          import('./evaluador/evaluador.module').then(
            (m) => m.EvaluadorModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_EVALUADORES_TITLE,
          hasAnyAuthorityForAnyUO: ['ETI-EVR-V', 'ETI-EVR-C', 'ETI-EVR-E', 'ETI-EVR-B']
        }
      },
      {
        path: ETI_ROUTE_NAMES.MEMORIAS,
        loadChildren: () =>
          import('./memoria/memoria-ges.module').then(
            (m) => m.MemoriaGesModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_MEMORIAS_TITLE,
          hasAuthorityForAnyUO: 'ETI-PEV-V'
        }
      },
      {
        path: ETI_ROUTE_NAMES.SEGUIMIENTOS,
        loadChildren: () =>
          import('./seguimiento/seguimiento.module').then(
            (m) => m.SeguimientoModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_SEGUIMIENTOS_TITLE,
          hasAnyAuthorityForAnyUO: ['ETI-EVC-V', 'ETI-EVC-VR', 'ETI-EVC-EVAL', 'ETI-EVC-EVALR']
        }
      },
      {
        path: ETI_ROUTE_NAMES.GESTION_SEGUIMIENTO,
        loadChildren: () =>
          import('./gestion-seguimiento/gestion-seguimiento.module').then(
            (m) => m.GestionSeguimientoModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_GESTION_SEGUIMIENTO_TITLE,
          hasAnyAuthorityForAnyUO: ['ETI-EVC-V', 'ETI-EVC-EVAL']
        }
      },
      {
        path: ETI_ROUTE_NAMES.PETICIONES_EVALUACION,
        loadChildren: () =>
          import('./peticion-evaluacion/peticion-evaluacion-ges.module').then(
            (m) => m.PeticionEvaluacionGesModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_PETICIONES_EVALUACION_TITLE,
          hasAnyAuthorityForAnyUO: ['ETI-PEV-V']
        }
      }, {
        path: ETI_ROUTE_NAMES.CONFIGURACIONES,
        loadChildren: () =>
          import('./configuracion/configuracion.module').then(
            (m) => m.ConfiguracionModule
          ),
        canActivate: [SgiAuthGuard],
        data: {
          title: MSG_CONFIGURACION_TITLE,
          hasAnyAuthorityForAnyUO: ['ETI-CNF-E']
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
export class EtiRoutingModule {
}
