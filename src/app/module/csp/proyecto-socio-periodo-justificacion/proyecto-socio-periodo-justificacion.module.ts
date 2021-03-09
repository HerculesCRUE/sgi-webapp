import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthModule } from '@sgi/framework/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProyectoSocioPeriodoJustificacionGuard } from './proyecto-socio-periodo-justificacion.guard';
import { ProyectoSocioPeriodoJustificacionRouting } from './proyecto-socio-periodo-justificacion-routing.module';
import { ProyectoSocioPeriodoJustificacionCrearComponent } from './proyecto-socio-periodo-justificacion-crear/proyecto-socio-periodo-justificacion-crear.component';
import { ProyectoSocioPeriodoJustificacionEditarComponent } from './proyecto-socio-periodo-justificacion-editar/proyecto-socio-periodo-justificacion-editar.component';
import { ProyectoSocioPeriodoJustificacionDatosGeneralesComponent } from './proyecto-socio-periodo-justificacion-formulario/proyecto-socio-periodo-justificacion-datos-generales/proyecto-socio-periodo-justificacion-datos-generales.component';
import { ProyectoSocioPeriodoJustificacionDocumentosComponent } from './proyecto-socio-periodo-justificacion-formulario/proyecto-socio-periodo-justificacion-documentos/proyecto-socio-periodo-justificacion-documentos.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';

@NgModule({
  declarations: [
    ProyectoSocioPeriodoJustificacionCrearComponent,
    ProyectoSocioPeriodoJustificacionEditarComponent,
    ProyectoSocioPeriodoJustificacionDatosGeneralesComponent,
    ProyectoSocioPeriodoJustificacionDocumentosComponent],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    ProyectoSocioPeriodoJustificacionRouting,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule
  ],
  providers: [
    ProyectoSocioPeriodoJustificacionGuard
  ]
})
export class ProyectoSocioPeriodoJustificacionModule { }
