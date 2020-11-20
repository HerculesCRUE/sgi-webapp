import { SgiRoutes } from '@core/route';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SgiAuthGuard } from '@sgi/framework/auth';

import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { ConvocatoriaListadoComponent } from './convocatoria-listado/convocatoria-listado.component';
import { ROUTE_NAMES } from '@core/route.names';
import { ActionGuard } from '@core/guards/master-form.guard';
import { ConvocatoriaCrearComponent } from './convocatoria-crear/convocatoria-crear.component';
import { CONVOCATORIA_ROUTE_NAMES } from './convocatoria-route-names';
import { ConvocatoriaDatosGeneralesComponent } from './convocatoria-formulario/convocatoria-datos-generales/convocatoria-datos-generales.component';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ConvocatoriaSeguimientoCientificoComponent } from './convocatoria-formulario/convocatoria-seguimiento-cientifico/convocatoria-seguimiento-cientifico.component';
import { ConvocatoriaPeriodosJustificacionComponent } from './convocatoria-formulario/convocatoria-periodos-justificacion/convocatoria-periodos-justificacion.component';
import { ConvocatoriaEditarComponent } from './convocatoria-editar/convocatoria-editar.component';
import { ConvocatoriaResolver } from './convocatoria.resolver';
import { ConvocatoriaPlazosFasesComponent } from './convocatoria-formulario/convocatoria-plazos-fases/convocatoria-plazos-fases.component';
import { ConvocatoriaHitosComponent } from './convocatoria-formulario/convocatoria-hitos/convocatoria-hitos.component';
import { ConvocatoriaEntidadesConvocantesComponent } from './convocatoria-formulario/convocatoria-entidades-convocantes/convocatoria-entidades-convocantes.component';
import { ConvocatoriaEntidadesFinanciadorasComponent } from './convocatoria-formulario/convocatoria-entidades-financiadoras/convocatoria-entidades-financiadoras.component';
import { ConvocatoriaEnlaceComponent } from './convocatoria-formulario/convocatoria-enlace/convocatoria-enlace.component';
import { ConvocatoriaRequisitosIPComponent } from './convocatoria-formulario/convocatoria-requisitos-ip/convocatoria-requisitos-ip.component';
import { ConvocatoriaConceptoGastoComponent } from './convocatoria-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.component';
import { ConvocatoriaRequisitosEquipoComponent } from './convocatoria-formulario/convocatoria-requisitos-equipo/convocatoria-requisitos-equipo.component';
import { ConvocatoriaConceptoGastoCodigoEcComponent } from './convocatoria-formulario/convocatoria-concepto-gasto-codigo-ec/convocatoria-concepto-gasto-codigo-ec.component';
import { ConvocatoriaDocumentosComponent } from './convocatoria-formulario/convocatoria-documentos/convocatoria-documentos.component';

const MSG_EDIT_TITLE = marker('csp.convocatoria.editar.titulo');
const MSG_LISTADO_TITLE = marker('csp.convocatoria.listado.titulo');
const MSG_NEW_TITLE = marker('csp.convocatoria.crear.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: ConvocatoriaListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
    }
  },
  {
    path: ROUTE_NAMES.NEW,
    component: ConvocatoriaCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: CONVOCATORIA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.DATOS_GENERALES,
        component: ConvocatoriaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.PERIODO_JUSTIFICACION,
        component: ConvocatoriaPeriodosJustificacionComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.PLAZOS_FASES,
        component: ConvocatoriaPlazosFasesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.HITOS,
        component: ConvocatoriaHitosComponent
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.ENTIDADES_CONVOCANTES,
        component: ConvocatoriaEntidadesConvocantesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.ENTIDADES_FINANCIADORAS,
        component: ConvocatoriaEntidadesFinanciadorasComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.SEGUIMIENTO_CIENTIFICO,
        component: ConvocatoriaSeguimientoCientificoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.ENLACES,
        component: ConvocatoriaEnlaceComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.REQUISITOS_IP,
        component: ConvocatoriaRequisitosIPComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.ELEGIBILIDAD,
        component: ConvocatoriaConceptoGastoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.REQUISITOS_EQUIPO,
        component: ConvocatoriaRequisitosEquipoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.CODIGOS_ECONOMICOS,
        component: ConvocatoriaConceptoGastoCodigoEcComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.DOCUMENTOS,
        component: ConvocatoriaDocumentosComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  },
  {
    path: `:id`,
    component: ConvocatoriaEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      convocatoria: ConvocatoriaResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: CONVOCATORIA_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.DATOS_GENERALES,
        component: ConvocatoriaDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      }, {
        path: CONVOCATORIA_ROUTE_NAMES.PERIODO_JUSTIFICACION,
        component: ConvocatoriaPeriodosJustificacionComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.PLAZOS_FASES,
        component: ConvocatoriaPlazosFasesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.HITOS,
        component: ConvocatoriaHitosComponent
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.ENTIDADES_CONVOCANTES,
        component: ConvocatoriaEntidadesConvocantesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.ENTIDADES_FINANCIADORAS,
        component: ConvocatoriaEntidadesFinanciadorasComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.ENLACES,
        component: ConvocatoriaEnlaceComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.SEGUIMIENTO_CIENTIFICO,
        component: ConvocatoriaSeguimientoCientificoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.REQUISITOS_IP,
        component: ConvocatoriaRequisitosIPComponent,
        canDeactivate: [FragmentGuard]
      }, 
      {
        path: CONVOCATORIA_ROUTE_NAMES.ELEGIBILIDAD,
        component: ConvocatoriaConceptoGastoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.REQUISITOS_EQUIPO,
        component: ConvocatoriaRequisitosEquipoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.CODIGOS_ECONOMICOS,
        component: ConvocatoriaConceptoGastoCodigoEcComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.DOCUMENTOS,
        component: ConvocatoriaDocumentosComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConvocatoriaRoutingModule {
}
