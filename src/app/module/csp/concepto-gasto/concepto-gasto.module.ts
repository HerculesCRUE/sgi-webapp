import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptoGastoListadoComponent } from './concepto-gasto-listado/concepto-gasto-listado.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { ConceptoGastoModalComponent } from './concepto-gasto-modal/concepto-gasto-modal.component';
import { ConceptoGastoRoutingModule } from './concepto-gasto-routing.module';


@NgModule({
  declarations: [ConceptoGastoListadoComponent, ConceptoGastoModalComponent],
  imports: [
    CommonModule,
    ConceptoGastoRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialDesignModule,
    TranslateModule,
    SharedModule
  ]
})
export class ConceptoGastoModule { }
