import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MSG_PARAMS } from '@core/i18n';
import { SgiAuthGuard, SgiAuthRoutes } from '@sgi/framework/auth';
import { TipoEnlaceListadoComponent } from './tipo-enlace-listado/tipo-enlace-listado.component';

const MSG_LISTADO_TITLE = marker('csp.tipo-enlace');

const routes: SgiAuthRoutes = [
  {
    path: '',
    component: TipoEnlaceListadoComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_LISTADO_TITLE,
      titleParams: MSG_PARAMS.CARDINALIRY.PLURAL
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipoEnlaceRoutingModule {
}
