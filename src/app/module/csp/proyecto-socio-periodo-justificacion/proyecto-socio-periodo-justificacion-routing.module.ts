import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ProyectoSocioPeriodoJustificacionGuard } from './proyecto-socio-periodo-justificacion.guard';
import { PROYECTO_SOCIO_PERIODO_JUSTIFICACION_ROUTE_NAMES } from './proyecto-socio-periodo-justificacion-names';
import { ProyectoSocioPeriodoJustificacionDocumentosComponent } from './proyecto-socio-periodo-justificacion-formulario/proyecto-socio-periodo-justificacion-documentos/proyecto-socio-periodo-justificacion-documentos.component';
import { ProyectoSocioPeriodoJustificacionDatosGeneralesComponent } from './proyecto-socio-periodo-justificacion-formulario/proyecto-socio-periodo-justificacion-datos-generales/proyecto-socio-periodo-justificacion-datos-generales.component';
import { ProyectoSocioPeriodoJustificacionEditarComponent } from './proyecto-socio-periodo-justificacion-editar/proyecto-socio-periodo-justificacion-editar.component';
import { ProyectoSocioPeriodoJustificacionCrearComponent } from './proyecto-socio-periodo-justificacion-crear/proyecto-socio-periodo-justificacion-crear.component';

const MSG_NEW_TITLE = marker('csp.proyecto-socio-periodo-justificacion.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.proyecto-socio-periodo-justificacion.editar.titulo');

const routes: SgiRoutes = [
  {
    path: `${ROUTE_NAMES.NEW}`,
    component: ProyectoSocioPeriodoJustificacionCrearComponent,
    canActivate: [SgiAuthGuard, ProyectoSocioPeriodoJustificacionGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_SOCIO_PERIODO_JUSTIFICACION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PROYECTO_SOCIO_PERIODO_JUSTIFICACION_ROUTE_NAMES.DATOS_GENERALES,
        component: ProyectoSocioPeriodoJustificacionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_PERIODO_JUSTIFICACION_ROUTE_NAMES.DOCUMENTOS,
        component: ProyectoSocioPeriodoJustificacionDocumentosComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: ProyectoSocioPeriodoJustificacionEditarComponent,
    canActivate: [SgiAuthGuard, ProyectoSocioPeriodoJustificacionGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_EDIT_TITLE
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: PROYECTO_SOCIO_PERIODO_JUSTIFICACION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: PROYECTO_SOCIO_PERIODO_JUSTIFICACION_ROUTE_NAMES.DATOS_GENERALES,
        component: ProyectoSocioPeriodoJustificacionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: PROYECTO_SOCIO_PERIODO_JUSTIFICACION_ROUTE_NAMES.DOCUMENTOS,
        component: ProyectoSocioPeriodoJustificacionDocumentosComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProyectoSocioPeriodoJustificacionRouting {
}
