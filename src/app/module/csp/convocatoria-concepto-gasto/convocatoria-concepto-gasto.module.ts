import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { ConvocatoriaConceptoGastoCrearComponent } from './convocatoria-concepto-gasto-crear/convocatoria-concepto-gasto-crear.component';
import { ConvocatoriaConceptoGastoEditarComponent } from './convocatoria-concepto-gasto-editar/convocatoria-concepto-gasto-editar.component';
import { ConvocatoriaConceptoGastoRouting } from './convocatoria-concepto-gasto-routing.module';
import { ConvocatoriaConceptoGastoComponent } from './convocatoria-concepto-gasto-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.component';
import { ConvocatoriaConceptoGastoGuard } from './convocatoria-concepto-gasto.guard';
import { CspModalsModule } from '../modals/csp-modals.module';
import { ConvocatoriaConceptoGastoCodigoEcComponent } from './convocatoria-concepto-gasto-formulario/convocatoria-concepto-gasto-codigo-ec/convocatoria-concepto-gasto-codigo-ec.component';
import { ConvocatoriaConceptoGastoCodigoEcModalComponent } from './modals/convocatoria-concepto-gasto-codigo-ec-modal/convocatoria-concepto-gasto-codigo-ec-modal.component';

@NgModule({
  declarations: [
    ConvocatoriaConceptoGastoCrearComponent,
    ConvocatoriaConceptoGastoEditarComponent,
    ConvocatoriaConceptoGastoComponent,
    ConvocatoriaConceptoGastoCodigoEcComponent,
    ConvocatoriaConceptoGastoCodigoEcModalComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    ConvocatoriaConceptoGastoRouting,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule,
    CspModalsModule
  ],
  providers: [
    ConvocatoriaConceptoGastoGuard
  ]
})
export class ConvocatoriaConceptoGastoModule { }
