import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MaterialDesignModule } from '@material/material-design.module';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableType } from './types/table-type.component';
import { TableTypeRepetible } from './types/table-type-repetible.component';
import { SharedModule } from '@shared/shared.module';
import { requiredChecked } from './validators/utils.validator';
import { PanelWrapperComponent } from './wrappers/panel-wrapper';
import { TitleDivWrapperComponent } from './wrappers/title-div.wrapper';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';

@NgModule({
  declarations: [
    TableType,
    TableTypeRepetible,
    PanelWrapperComponent,
    TitleDivWrapperComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MaterialDesignModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyMatDatepickerModule,
    FormlyModule.forRoot({
      types: [
        {
          name: 'table',
          component: TableType
        },
        {
          name: 'table-repetible',
          component: TableTypeRepetible
        }
      ],
      wrappers: [
        {
          name: 'expansion-panel',
          component: PanelWrapperComponent
        },
        {
          name: 'title-div',
          component: TitleDivWrapperComponent
        }
      ],
      validators: [
        { name: 'requiredChecked', validation: requiredChecked },
        /** TODO: Remove when any declared template didn't use it */
        { name: 'nif', validation: Validators.required },
      ],
    }),
    FormlyMaterialModule
  ],
  exports: [
    TableType,
    TableTypeRepetible,
    FormlyMatDatepickerModule,
    FormlyModule,
    FormlyMaterialModule
  ]
})
export class FormlyFormsModule { }
