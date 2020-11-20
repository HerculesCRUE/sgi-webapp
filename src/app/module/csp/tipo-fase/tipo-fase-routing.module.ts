import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRoutes } from '@core/route';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { TipoFaseListadoComponent } from './tipo-fase-listado/tipo-fase-listado.component';

const MSG_LISTADO_TITLE = marker('csp.tipo.fase.listado.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: TipoFaseListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE
    }
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TipoFaseRoutingModule {
}
