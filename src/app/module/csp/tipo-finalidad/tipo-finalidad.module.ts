import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoFinalidadListadoComponent } from './tipo-finalidad-listado/tipo-finalidad-listado.component';
import { TipoFinalidadRoutingModule } from './tipo-finalidad-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { TipoFinalidadModalComponent } from './tipo-finalidad-modal/tipo-finalidad-modal.component';

@NgModule({
  declarations: [
    TipoFinalidadListadoComponent,
    TipoFinalidadModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TipoFinalidadRoutingModule,
    MaterialDesignModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule
  ]
})
export class TipoFinalidadModule { }
