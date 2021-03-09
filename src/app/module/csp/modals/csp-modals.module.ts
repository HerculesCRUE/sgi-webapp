import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { EntidadFinanciadoraModalComponent } from '../modals/entidad-financiadora-modal/entidad-financiadora-modal.component';
import { PartidaGastoModalComponent } from './partida-gasto-modal/partida-gasto-modal.component';

@NgModule({
  declarations: [
    EntidadFinanciadoraModalComponent,
    PartidaGastoModalComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    EntidadFinanciadoraModalComponent,
    PartidaGastoModalComponent
  ]
})
export class CspModalsModule { }
