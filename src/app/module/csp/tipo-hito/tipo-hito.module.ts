import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { TipoHitoRoutingModule } from './tipo-hito-routing.module';
import { TipoHitoModalComponent } from './tipo-hito-modal/tipo-hito-modal.component';
import { TipoHitoListadoComponent } from './tipo-hito-listado/tipo-hito-listado.component';

@NgModule({
  declarations: [
    TipoHitoListadoComponent,
    TipoHitoModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TipoHitoRoutingModule,
    MaterialDesignModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule
  ],
  providers: [
  ]
})
export class TipoHitoModule { }
