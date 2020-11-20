import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiAuthGuard, SgiAuthRoutes } from '@sgi/framework/auth';
import { FuenteFinanciacionListadoComponent } from './fuente-financiacion-listado/fuente-financiacion-listado.component';

const MSG_LISTADO_TITLE = marker('csp.fuenteFinanciacion.listado.titulo');

const routes: SgiAuthRoutes = [
  {
    path: '',
    component: FuenteFinanciacionListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      // hasAuthorityForAnyUO: 'CSP-FFIN-V'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FuenteFinanciacionRoutingModule {
}
