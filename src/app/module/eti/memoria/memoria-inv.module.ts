import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SgiAuthModule } from '@sgi/framework/auth';
import { MemoriaDatosGeneralesComponent } from '../memoria/memoria-formulario/memoria-datos-generales/memoria-datos-generales.component';
import { MemoriaEditarComponent } from '../memoria/memoria-editar/memoria-editar.component';
import { MemoriaResolver } from './memoria.resolver';
import { MemoriaRoutingInvModule } from './memoria-routing-inv.module';
import { MemoriaCrearGuard } from './memoria-crear/memoria-crear.guard';
import { MemoriaDocumentacionComponent } from './memoria-formulario/memoria-documentacion/memoria-documentacion.component';
import { MemoriaDocumentacionMemoriaModalComponent } from './modals/memoria-documentacion-memoria-modal/memoria-documentacion-memoria-modal.component';
import { MemoriaDocumentacionSeguimientosModalComponent } from './modals/memoria-documentacion-seguimientos-modal/memoria-documentacion-seguimientos-modal.component';
import { MemoriaCrearComponent } from './memoria-crear/memoria-crear.component';
import { MemoriaEvaluacionesComponent } from './memoria-formulario/memoria-evaluaciones/memoria-evaluaciones.component';
import { MemoriaListadoInvComponent } from './memoria-listado-inv/memoria-listado-inv.component';
import { MemoriaInformesComponent } from './memoria-formulario/memoria-informes/memoria-informes.component';
import { FormlyFormsModule } from '@formly-forms/formly-forms.module';
import { MemoriaFormularioComponent } from './memoria-formulario/memoria-formulario/memoria-formulario.component';


@NgModule({
  declarations: [
    MemoriaListadoInvComponent,
    MemoriaCrearComponent,
    MemoriaDatosGeneralesComponent,
    MemoriaFormularioComponent,
    MemoriaEditarComponent,
    MemoriaDocumentacionComponent,
    MemoriaDocumentacionMemoriaModalComponent,
    MemoriaDocumentacionSeguimientosModalComponent,
    MemoriaEvaluacionesComponent,
    MemoriaInformesComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MemoriaRoutingInvModule,
    TranslateModule,
    MaterialDesignModule,
    FormsModule,
    ReactiveFormsModule,
    SgiAuthModule,
    FormlyFormsModule
  ],
  providers: [
    MemoriaResolver,
    MemoriaCrearGuard
  ]
})
export class MemoriaInvModule { }