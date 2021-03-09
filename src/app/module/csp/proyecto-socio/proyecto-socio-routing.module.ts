import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ProyectoSocioCrearComponent } from './proyecto-socio-crear/proyecto-socio-crear.component';
import { ProyectoSocioEditarComponent } from './proyecto-socio-editar/proyecto-socio-editar.component';
import { ProyectoSocioDatosGeneralesComponent } from './proyecto-socio-formulario/proyecto-socio-datos-generales/proyecto-socio-datos-generales.component';
import { PROYECTO_SOCIO_ROUTE_NAMES } from './proyecto-socio-route-names';
import { ProyectoSocioGuard } from './proyecto-socio.guard';
import { ProyectoSocioEquipoComponent } from './proyecto-socio-formulario/proyecto-socio-equipo/proyecto-socio-equipo.component';
import { ProyectoSocioPeriodoPagoComponent } from './proyecto-socio-formulario/proyecto-socio-periodo-pago/proyecto-socio-periodo-pago.component';
import { ProyectoSocioPeriodoJustificacionComponent } from './proyecto-socio-formulario/proyecto-socio-periodo-justificacion/proyecto-socio-periodo-justificacion.component';


const MSG_NEW_TITLE = marker('csp.proyecto.socios.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.proyecto.socios.editar.titulo');

const routes: SgiRoutes = [
  {
    path: `${ROUTE_NAMES.NEW}`,
    component: ProyectoSocioCrearComponent,
    canActivate: [SgiAuthGuard, ProyectoSocioGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES,
        component: ProyectoSocioDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.EQUIPO,
        component: ProyectoSocioEquipoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.PERIODO_PAGO,
        component: ProyectoSocioPeriodoPagoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.PERIODO_JUSTIFICACION,
        component: ProyectoSocioPeriodoJustificacionComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: ProyectoSocioEditarComponent,
    canActivate: [SgiAuthGuard, ProyectoSocioGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_EDIT_TITLE
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.DATOS_GENERALES,
        component: ProyectoSocioDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.EQUIPO,
        component: ProyectoSocioEquipoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.PERIODO_PAGO,
        component: ProyectoSocioPeriodoPagoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_ROUTE_NAMES.PERIODO_JUSTIFICACION,
        component: ProyectoSocioPeriodoJustificacionComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProyectoSocioRouting {
}
