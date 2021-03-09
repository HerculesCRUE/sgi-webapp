import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SolicitudProyectoSocioCrearComponent } from './solicitud-proyecto-socio-crear/solicitud-proyecto-socio-crear.component';
import { SolicitudProyectoSocioEditarComponent } from './solicitud-proyecto-socio-editar/solicitud-proyecto-socio-editar.component';
import { SolicitudProyectoSocioDatosGeneralesComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-datos-generales/solicitud-proyecto-socio-datos-generales.component';
import { SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES } from './solicitud-proyecto-socio-route-names';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { SolicitudProyectoSocioGuard } from './solicitud-proyecto-socio.guard';
import { SolicitudProyectoSocioPeriodoPagoComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-periodo-pago/solicitud-proyecto-socio-periodo-pago.component';
import { SolicitudProyectoPeriodoJustificacionesComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-periodo-justificaciones/solicitud-proyecto-periodo-justificaciones.component';
import { SolicitudProyectoSocioEquipoSocioComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-equipo-socio/solicitud-proyecto-socio-equipo-socio.component';

const MSG_NEW_TITLE = marker('csp.solicitud-proyecto-socio.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.solicitud-proyecto-socio.editar.titulo');

const routes: SgiRoutes = [
  {
    path: ROUTE_NAMES.NEW,
    component: SolicitudProyectoSocioCrearComponent,
    canActivate: [SgiAuthGuard, SolicitudProyectoSocioGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES,
        component: SolicitudProyectoSocioDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.PERIODOS_PAGOS,
        component: SolicitudProyectoSocioPeriodoPagoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.PERIODOS_JUSTIFICACION,
        component: SolicitudProyectoPeriodoJustificacionesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.EQUIPO_SOCIO,
        component: SolicitudProyectoSocioEquipoSocioComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: SolicitudProyectoSocioEditarComponent,
    canActivate: [SgiAuthGuard, SolicitudProyectoSocioGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_EDIT_TITLE
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES,
        component: SolicitudProyectoSocioDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.PERIODOS_PAGOS,
        component: SolicitudProyectoSocioPeriodoPagoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.PERIODOS_JUSTIFICACION,
        component: SolicitudProyectoPeriodoJustificacionesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: SOLICITUD_PROYECTO_SOCIO_ROUTE_NAMES.EQUIPO_SOCIO,
        component: SolicitudProyectoSocioEquipoSocioComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudProyectoSocioRouting {
}
