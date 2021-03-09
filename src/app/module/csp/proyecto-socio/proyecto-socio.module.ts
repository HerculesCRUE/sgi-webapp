import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { ProyectoSocioCrearComponent } from './proyecto-socio-crear/proyecto-socio-crear.component';
import { ProyectoSocioEditarComponent } from './proyecto-socio-editar/proyecto-socio-editar.component';
import { ProyectoSocioRouting } from './proyecto-socio-routing.module';
import { ProyectoSocioDatosGeneralesComponent } from './proyecto-socio-formulario/proyecto-socio-datos-generales/proyecto-socio-datos-generales.component';
import { ProyectoSocioGuard } from './proyecto-socio.guard';
import { ProyectoSocioEquipoModalComponent } from './modals/proyecto-socio-equipo-modal/proyecto-socio-equipo-modal.component';
import { ProyectoSocioEquipoComponent } from './proyecto-socio-formulario/proyecto-socio-equipo/proyecto-socio-equipo.component';
import { ProyectoSocioPeriodoPagoComponent } from './proyecto-socio-formulario/proyecto-socio-periodo-pago/proyecto-socio-periodo-pago.component';
import { ProyectoSocioPeriodoPagoModalComponent } from './modals/proyecto-socio-periodo-pago-modal/proyecto-socio-periodo-pago-modal.component';
import { ProyectoSocioPeriodoJustificacionComponent } from './proyecto-socio-formulario/proyecto-socio-periodo-justificacion/proyecto-socio-periodo-justificacion.component';

@NgModule({
  declarations: [
    ProyectoSocioCrearComponent,
    ProyectoSocioEditarComponent,
    ProyectoSocioDatosGeneralesComponent,
    ProyectoSocioEquipoComponent,
    ProyectoSocioEquipoModalComponent,
    ProyectoSocioPeriodoPagoComponent,
    ProyectoSocioPeriodoPagoModalComponent,
    ProyectoSocioPeriodoJustificacionComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    ProyectoSocioRouting,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    ProyectoSocioGuard
  ]
})
export class ProyectoSocioModule { }
