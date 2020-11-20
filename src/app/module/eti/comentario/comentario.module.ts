import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';

import { ComentarioCrearModalComponent } from './comentario-crear-modal/comentario-crear-modal.component';
import { ComentarioEditarModalComponent } from './comentario-editar-modal/comentario-editar-modal.component';

@NgModule({
  declarations: [
    ComentarioCrearModalComponent,
    ComentarioEditarModalComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
  ],
  entryComponents: [
    ComentarioCrearModalComponent,
    ComentarioEditarModalComponent
  ]
})
export class ComentarioModule { }
