import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoDocumentoListadoComponent } from './tipo-documento-listado/tipo-documento-listado.component';
import { TipoDocumentoRoutingModule } from './tipo-documento-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { TipoDocumentoModalComponent } from './tipo-documento-modal/tipo-documento-modal.component';

@NgModule({
  declarations: [
    TipoDocumentoListadoComponent,
    TipoDocumentoModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TipoDocumentoRoutingModule,
    MaterialDesignModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule
  ]
})
export class TipoDocumentoModule { }
