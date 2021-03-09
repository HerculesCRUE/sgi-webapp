import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { ProyectoPeriodoSeguimientoCrearComponent } from './proyecto-periodo-seguimiento-crear/proyecto-periodo-seguimiento-crear.component';
import { ProyectoPeriodoSeguimientoEditarComponent } from './proyecto-periodo-seguimiento-editar/proyecto-periodo-seguimiento-editar.component';
import { ProyectoPeriodoSeguimientoRouting } from './proyecto-periodo-seguimiento-routing.module';
import { ProyectoPeriodoSeguimientoDatosGeneralesComponent } from './proyecto-periodo-seguimiento-formulario/proyecto-periodo-seguimiento-datos-generales/proyecto-periodo-seguimiento-datos-generales.component';
import { ProyectoPeriodoSeguimientoGuard } from './proyecto-periodo-seguimiento.guard';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ProyectoPeriodoSeguimientoDocumentosComponent } from './proyecto-periodo-seguimiento-formulario/proyecto-periodo-seguimiento-documentos/proyecto-periodo-seguimiento-documentos.component';


@NgModule({
  declarations: [
    ProyectoPeriodoSeguimientoCrearComponent,
    ProyectoPeriodoSeguimientoEditarComponent,
    ProyectoPeriodoSeguimientoDatosGeneralesComponent,
    ProyectoPeriodoSeguimientoDocumentosComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    ProyectoPeriodoSeguimientoRouting,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule

  ],
  providers: [
    ProyectoPeriodoSeguimientoGuard
  ]
})
export class ProyectoPeriodoSeguimientoModule { }
