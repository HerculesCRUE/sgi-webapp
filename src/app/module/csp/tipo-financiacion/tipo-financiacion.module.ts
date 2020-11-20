import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { TipoFinanciacionRoutingModule } from './tipo-financiacion-routing.module';
import { TipoFinanciacionModalComponent } from './tipo-financiacion-modal/tipo-financiacion-modal.component';
import { TipoFinanciacionListadoComponent } from './tipo-financiacion-listado/tipo-financiacion-listado.component';

@NgModule({
  declarations: [
    TipoFinanciacionListadoComponent,
    TipoFinanciacionModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TipoFinanciacionRoutingModule,
    MaterialDesignModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule
  ],
  providers: [
  ]
})
export class TipoFinanciacionModule { }
