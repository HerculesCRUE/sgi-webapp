import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { SolicitudProyectoPresupuestoGuard } from './solicitud-proyecto-presupuesto.guard';
import { SolicitudProyectoPresupuestoAjenaRoutingModule } from './solicitud-proyecto-presupuesto-ajena-routing.module';


@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    SolicitudProyectoPresupuestoAjenaRoutingModule,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    SolicitudProyectoPresupuestoGuard
  ]
})
export class SolicitudProyectoPresupuestoAjenaModule { }
