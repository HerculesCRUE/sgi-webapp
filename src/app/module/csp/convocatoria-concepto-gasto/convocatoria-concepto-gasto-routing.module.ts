import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentGuard } from '@core/guards/detail-form.guard';
import { ActionGuard } from '@core/guards/master-form.guard';
import { SgiRoutes } from '@core/route';
import { ROUTE_NAMES } from '@core/route.names';
import { SgiAuthGuard } from '@sgi/framework/auth';
import { ConvocatoriaConceptoGastoCrearComponent } from './convocatoria-concepto-gasto-crear/convocatoria-concepto-gasto-crear.component';
import { ConvocatoriaConceptoGastoEditarComponent } from './convocatoria-concepto-gasto-editar/convocatoria-concepto-gasto-editar.component';
import { ConvocatoriaConceptoGastoCodigoEcComponent } from './convocatoria-concepto-gasto-formulario/convocatoria-concepto-gasto-codigo-ec/convocatoria-concepto-gasto-codigo-ec.component';
import { ConvocatoriaConceptoGastoComponent } from './convocatoria-concepto-gasto-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.component';
import { CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES } from './convocatoria-concepto-gasto-route-names';
import { ConvocatoriaConceptoGastoGuard } from './convocatoria-concepto-gasto.guard';

const MSG_NEW_TITLE = marker('csp.convocatoria.concepto-gasto.crear.titulo');
const MSG_EDIT_TITLE = marker('csp.convocatoria.concepto-gasto.editar.titulo');

const routes: SgiRoutes = [
  {
    path: `${ROUTE_NAMES.NEW}`,
    component: ConvocatoriaConceptoGastoCrearComponent,
    canActivate: [SgiAuthGuard, ConvocatoriaConceptoGastoGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_NEW_TITLE,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES.CONCEPTO_GASTO
      },
      {
        path: CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES.CONCEPTO_GASTO,
        component: ConvocatoriaConceptoGastoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES.CODIGOS_ECONOMICOS,
        component: ConvocatoriaConceptoGastoCodigoEcComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  },
  {
    path: `:id`,
    component: ConvocatoriaConceptoGastoEditarComponent,
    canActivate: [SgiAuthGuard, ConvocatoriaConceptoGastoGuard],
    canDeactivate: [ActionGuard],
    data: {
      title: MSG_EDIT_TITLE
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES.CONCEPTO_GASTO
      },
      {
        path: CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES.CONCEPTO_GASTO,
        component: ConvocatoriaConceptoGastoComponent,
        canDeactivate: [FragmentGuard]
      },
      {
        path: CONVOCATORIA_CONCEPTO_GASTO_ROUTE_NAMES.CODIGOS_ECONOMICOS,
        component: ConvocatoriaConceptoGastoCodigoEcComponent,
        canDeactivate: [FragmentGuard]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConvocatoriaConceptoGastoRouting {
}
