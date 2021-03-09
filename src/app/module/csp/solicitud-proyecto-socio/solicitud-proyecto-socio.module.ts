import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { SolicitudProyectoSocioCrearComponent } from './solicitud-proyecto-socio-crear/solicitud-proyecto-socio-crear.component';
import { SolicitudProyectoSocioEditarComponent } from './solicitud-proyecto-socio-editar/solicitud-proyecto-socio-editar.component';
import { SolicitudProyectoSocioRouting } from './solicitud-proyecto-socio-routing.module';
import { SolicitudProyectoSocioDatosGeneralesComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-datos-generales/solicitud-proyecto-socio-datos-generales.component';
import { SolicitudProyectoSocioGuard } from './solicitud-proyecto-socio.guard';
import { SolicitudProyectoSocioPeriodoPagoComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-periodo-pago/solicitud-proyecto-socio-periodo-pago.component';
import { SolicitudProyectoSocioPeriodoPagoModalComponent } from './modals/solicitud-proyecto-socio-periodo-pago-modal/solicitud-proyecto-socio-periodo-pago-modal.component';
import { SolicitudProyectoPeriodoJustificacionesComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-periodo-justificaciones/solicitud-proyecto-periodo-justificaciones.component';
import { SolicitudProyectoPeriodoJustificacionesModalComponent } from './modals/solicitud-proyecto-periodo-justificaciones-modal/solicitud-proyecto-periodo-justificaciones-modal.component';
import { SolicitudProyectoSocioEquipoSocioComponent } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-equipo-socio/solicitud-proyecto-socio-equipo-socio.component';
import { SolicitudProyectoSocioEquipoSocioModalComponent } from './modals/solicitud-proyecto-socio-equipo-socio-modal/solicitud-proyecto-socio-equipo-socio-modal.component';

@NgModule({
  declarations: [
    SolicitudProyectoSocioCrearComponent,
    SolicitudProyectoSocioEditarComponent,
    SolicitudProyectoSocioDatosGeneralesComponent,
    SolicitudProyectoSocioPeriodoPagoComponent,
    SolicitudProyectoSocioPeriodoPagoModalComponent,
    SolicitudProyectoPeriodoJustificacionesComponent,
    SolicitudProyectoPeriodoJustificacionesModalComponent,
    SolicitudProyectoSocioEquipoSocioComponent,
    SolicitudProyectoSocioEquipoSocioModalComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    SolicitudProyectoSocioRouting,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    SolicitudProyectoSocioGuard
  ]
})
export class SolicitudProyectoSocioModule { }
