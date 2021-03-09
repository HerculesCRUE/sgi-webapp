import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudProyectoPresupuestoCrearComponent } from './solicitud-proyecto-presupuesto-crear/solicitud-proyecto-presupuesto-crear.component';
import { SolicitudProyectoPresupuestoEditarComponent } from './solicitud-proyecto-presupuesto-editar/solicitud-proyecto-presupuesto-editar.component';
import { SolicitudProyectoPresupuestoDatosGeneralesComponent } from './solicitud-proyecto-presupuesto-formulario/solicitud-proyecto-presupuesto-datos-generales/solicitud-proyecto-presupuesto-datos-generales.component';
import { SolicitudProyectoPresupuestoPartidasGastoComponent } from './solicitud-proyecto-presupuesto-formulario/solicitud-proyecto-presupuesto-partidas-gasto/solicitud-proyecto-presupuesto-partidas-gasto.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { SolicitudProyectoPresupuestoGuard } from './solicitud-proyecto-presupuesto.guard';
import { SolicitudProyectoPresupuestoRoutingModule } from './solicitud-proyecto-presupuesto-routing.module';



@NgModule({
  declarations: [
    SolicitudProyectoPresupuestoCrearComponent,
    SolicitudProyectoPresupuestoEditarComponent,
    SolicitudProyectoPresupuestoDatosGeneralesComponent,
    SolicitudProyectoPresupuestoPartidasGastoComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    SolicitudProyectoPresupuestoRoutingModule,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    SolicitudProyectoPresupuestoGuard
  ]
})
export class SolicitudProyectoPresupuestoModule { }
