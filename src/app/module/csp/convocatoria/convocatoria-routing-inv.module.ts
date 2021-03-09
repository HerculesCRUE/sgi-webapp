import { SgiRoutes } from '@core/route';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConvocatoriaListadoInvComponent } from './convocatoria-listado-inv/convocatoria-listado-inv.component';
import { ConvocatoriaEditarComponent } from './convocatoria-editar/convocatoria-editar.component';
import { ActionGuard } from '@core/guards/master-form.guard';
import { ConvocatoriaResolver } from './convocatoria.resolver';
import { ConfiguracionSolicitudResolver } from './configuracion-solicitud.resolver';
import { CONVOCATORIA_ROUTE_NAMES } from './convocatoria-route-names';
import { ConvocatoriaDatosGeneralesComponent } from './convocatoria-formulario/convocatoria-datos-generales/convocatoria-datos-generales.component';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ConvocatoriaConceptoGastoComponent } from './convocatoria-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.component';
import { ConvocatoriaConfiguracionSolicitudesComponent } from './convocatoria-formulario/convocatoria-configuracion-solicitudes/convocatoria-configuracion-solicitudes.component';
import { ConvocatoriaDocumentosComponent } from './convocatoria-formulario/convocatoria-documentos/convocatoria-documentos.component';
import { ConvocatoriaEnlaceComponent } from './convocatoria-formulario/convocatoria-enlace/convocatoria-enlace.component';
import { ConvocatoriaEntidadesConvocantesComponent } from './convocatoria-formulario/convocatoria-entidades-convocantes/convocatoria-entidades-convocantes.component';
import { ConvocatoriaEntidadesFinanciadorasComponent } from './convocatoria-formulario/convocatoria-entidades-financiadoras/convocatoria-entidades-financiadoras.component';
import { ConvocatoriaHitosComponent } from './convocatoria-formulario/convocatoria-hitos/convocatoria-hitos.component';
import { ConvocatoriaPeriodosJustificacionComponent } from './convocatoria-formulario/convocatoria-periodos-justificacion/convocatoria-periodos-justificacion.component';
import { ConvocatoriaPlazosFasesComponent } from './convocatoria-formulario/convocatoria-plazos-fases/convocatoria-plazos-fases.component';
import { ConvocatoriaRequisitosEquipoComponent } from './convocatoria-formulario/convocatoria-requisitos-equipo/convocatoria-requisitos-equipo.component';
import { ConvocatoriaRequisitosIPComponent } from './convocatoria-formulario/convocatoria-requisitos-ip/convocatoria-requisitos-ip.component';
import { ConvocatoriaSeguimientoCientificoComponent } from './convocatoria-formulario/convocatoria-seguimiento-cientifico/convocatoria-seguimiento-cientifico.component';
import { ModeloEjecucionIdResolver } from './modelo-ejecucion-id.resolver';

const MSG_CONVOCATORIAS_TITLE = marker('inv.convocatoria.listado.titulo');
const MSG_CONVOCATORIAS_VER_TITLE = marker('inv.convocatoria.ver.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: ConvocatoriaListadoInvComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_CONVOCATORIAS_TITLE,
    }
  },
  {
    path: `:id`,
    component: ConvocatoriaEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      convocatoriaId: ConvocatoriaResolver,
      configuracionSolicitud: ConfiguracionSolicitudResolver,
      modeloEjecucionId: ModeloEjecucionIdResolver
    },
    data: {
      title: MSG_CONVOCATORIAS_VER_TITLE,
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
        path: CONVOCATORIA_ROUTE_NAMES.DOCUMENTOS,
        component: ConvocatoriaDocumentosComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_ROUTE_NAMES.CONFIGURACION_SOLICITUDES,
        component: ConvocatoriaConfiguracionSolicitudesComponent,
        canDeactivate: [FragmentGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConvocatoriaRoutingInvModule {
}
