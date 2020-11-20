import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { TipoFaseModalComponent } from './tipo-fase-modal/tipo-fase-modal.component';
import { TipoFaseRoutingModule } from './tipo-fase-routing.module';
import { TipoFaseListadoComponent } from './tipo-fase-listado/tipo-fase-listado.component';

@NgModule({
  declarations: [
    TipoFaseListadoComponent,
    TipoFaseModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TipoFaseRoutingModule,
    MaterialDesignModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule
  ],
  providers: [
  ]
})
export class TipoFaseModule { }
