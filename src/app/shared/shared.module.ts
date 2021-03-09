import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { FooterCrearComponent } from './footers/footer-crear/footer-crear.component';
import { ActionFooterComponent } from './action-footer/action-footer.component';
import { RootComponent } from './root/root.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BuscarPersonaComponent } from './buscar-persona/buscar-persona.component';
import { BuscarPersonaDialogoComponent } from './buscar-persona/dialogo/buscar-persona-dialogo.component';
import { ActionFragmentMenuItemComponent } from './action-fragment-menu-item/action-fragment-menu-item.component';
import { ActionFragmentLinkItemComponent } from './action-fragment-link-item/action-fragment-link-item.component';
import { ActionFooterButtonComponent } from './action-footer-button/action-footer-button.component';
import { SelectPersonaComponent } from './select-persona/select-persona.component';
import { SelectEmpresaEconomicaComponent } from './select-empresa-economica/select-empresa-economica.component';
import { SearchEmpresaEconomicaModalComponent } from './select-empresa-economica/dialog/search-empresa-economica.component';
import { SelectConvocatoriaComponent } from './select-convocatoria/select-convocatoria.component';
import { SearchConvocatoriaModalComponent } from './select-convocatoria/dialog/search-convocatoria.component';
import { SgiFileUploadComponent } from './file-upload/file-upload.component';
import { ActionFragmentMenuGroupComponent } from './action-fragment-menu-group/action-fragment-menu-group.component';

@NgModule({
  declarations: [
    BreadcrumbComponent,
    FooterCrearComponent,
    ActionFooterComponent,
    ActionFooterButtonComponent,
    RootComponent,
    BuscarPersonaComponent,
    BuscarPersonaDialogoComponent,
    ActionFragmentMenuItemComponent,
    ActionFragmentLinkItemComponent,
    SelectPersonaComponent,
    SelectEmpresaEconomicaComponent,
    SearchEmpresaEconomicaModalComponent,
    SelectConvocatoriaComponent,
    SearchConvocatoriaModalComponent,
    SgiFileUploadComponent,
    ActionFragmentMenuGroupComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialDesignModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    BreadcrumbComponent,
    FooterCrearComponent,
    ActionFooterComponent,
    ActionFooterButtonComponent,
    RootComponent,
    BuscarPersonaComponent,
    ActionFragmentMenuItemComponent,
    ActionFragmentLinkItemComponent,
    SelectPersonaComponent,
    SelectEmpresaEconomicaComponent,
    SelectConvocatoriaComponent,
    SgiFileUploadComponent,
    ActionFragmentMenuGroupComponent
  ]
})
export class SharedModule {
}
