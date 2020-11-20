import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRoutes } from '@core/route';
import { ConfiguracionFormularioComponent } from './configuracion-formulario/configuracion-formulario.component';

const MSG_FORMULARIO_TITLE = marker('eti.configuracion.formulario.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: ConfiguracionFormularioComponent,
    canActivate: [SgiAuthGuard],
    data: {
      title: MSG_FORMULARIO_TITLE,
      hasAuthorityForAnyUO: 'ETI-CNF-E'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracionRoutingModule {
}
