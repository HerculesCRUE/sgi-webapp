import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SgiAuthModule } from '@sgi/framework/auth';
import { MemoriaResolver } from './memoria.resolver';
import { MemoriaRoutingGesModule } from './memoria-routing-ges.module';
import { MemoriaCrearGuard } from './memoria-crear/memoria-crear.guard';
import { MemoriaListadoGesComponent } from './memoria-listado-ges/memoria-listado-ges.component';
import { FormlyFormsModule } from '@formly-forms/formly-forms.module';

@NgModule({
  declarations: [
    MemoriaListadoGesComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MemoriaRoutingGesModule,
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
export class MemoriaGesModule { }