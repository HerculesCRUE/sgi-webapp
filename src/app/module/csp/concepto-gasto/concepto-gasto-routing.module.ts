import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiRoutes } from '@core/route';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ConceptoGastoListadoComponent } from './concepto-gasto-listado/concepto-gasto-listado.component';

const MSG_LISTADO_TITLE = marker('csp.concepto.gasto.listado.titulo');

const routes: SgiRoutes = [
  {
    path: '',
    component: ConceptoGastoListadoComponent,
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
export class ConceptoGastoRoutingModule {
}
