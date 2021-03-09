import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { ProyectoProrrogaCrearComponent } from './proyecto-prorroga-crear/proyecto-prorroga-crear.component';
import { ProyectoProrrogaEditarComponent } from './proyecto-prorroga-editar/proyecto-prorroga-editar.component';
import { ProyectoProrrogaRouting } from './proyecto-prorroga-routing.module';
import { ProyectoProrrogaDatosGeneralesComponent } from './proyecto-prorroga-formulario/proyecto-prorroga-datos-generales/proyecto-prorroga-datos-generales.component';
import { ProyectoProrrogaGuard } from './proyecto-prorroga.guard';
import { ProyectoProrrogaDocumentosComponent } from './proyecto-prorroga-formulario/proyecto-prorroga-documentos/proyecto-prorroga-documentos.component';


@NgModule({
  declarations: [
    ProyectoProrrogaCrearComponent,
    ProyectoProrrogaEditarComponent,
    ProyectoProrrogaDatosGeneralesComponent,
    ProyectoProrrogaDocumentosComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    ProyectoProrrogaRouting,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    ProyectoProrrogaGuard
  ]
})
export class ProyectoProrrogaModule { }
