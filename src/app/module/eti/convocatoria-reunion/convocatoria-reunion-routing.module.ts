import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConvocatoriaReunionListadoComponent } from './convocatoria-reunion-listado/convocatoria-reunion-listado.component';
import { ConvocatoriaReunionCrearComponent } from './convocatoria-reunion-crear/convocatoria-reunion-crear.component';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiRoutes } from '@core/route';
import { ActionGuard } from '@core/guards/master-form.guard';
import { CONVOCATORIA_REUNION_ROUTE_NAMES } from './convocatoria-reunion-route-names';
import { ConvocatoriaReunionDatosGeneralesComponent } from './convocatoria-reunion-formulario/convocatoria-reunion-datos-generales/convocatoria-reunion-datos-generales.component';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ConvocatoriaReunionEditarComponent } from './convocatoria-reunion-editar/convocatoria-reunion-editar.component';
import { ConvocatoriaReunionResolver } from './convocatoria-reunion.resolver';
import { ConvocatoriaReunionAsignacionMemoriasListadoComponent } from './convocatoria-reunion-formulario/convocatoria-reunion-asignacion-memorias/convocatoria-reunion-asignacion-memorias-listado/convocatoria-reunion-asignacion-memorias-listado.component';


const MSG_LISTADO_TITLE = marker('eti.convocatoriaReunion.listado.titulo');
const MSG_NEW_TITLE = marker('eti.convocatoriaReunion.crear.titulo');
const MSG_EDIT_TITLE = marker('eti.convocatoriaReunion.editar.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: ConvocatoriaReunionListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      hasAuthorityForAnyUO: 'ETI-CNV-V'
    }
  },
  {
    path: ROUTE_NAMES.NEW,
    component: ConvocatoriaReunionCrearComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
      hasAuthorityForAnyUO: 'ETI-CNV-C'
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: CONVOCATORIA_REUNION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: CONVOCATORIA_REUNION_ROUTE_NAMES.DATOS_GENERALES,
        component: ConvocatoriaReunionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_REUNION_ROUTE_NAMES.ASIGNACION_MEMORIAS,
        component: ConvocatoriaReunionAsignacionMemoriasListadoComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: ConvocatoriaReunionEditarComponent,
    canActivate: [SgiAuthGuard],
    canDeactivate: [ActionGuard],
    resolve: {
      convocatoriaReunion: ConvocatoriaReunionResolver
    },
    data: {
      title: MSG_EDIT_TITLE,
      hasAuthorityForAnyUO: 'ETI-CNV-E'
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: CONVOCATORIA_REUNION_ROUTE_NAMES.DATOS_GENERALES
      },
      {
        path: CONVOCATORIA_REUNION_ROUTE_NAMES.DATOS_GENERALES,
        component: ConvocatoriaReunionDatosGeneralesComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_REUNION_ROUTE_NAMES.ASIGNACION_MEMORIAS,
        component: ConvocatoriaReunionAsignacionMemoriasListadoComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConvocatoriaReunionRoutingModule {
}
