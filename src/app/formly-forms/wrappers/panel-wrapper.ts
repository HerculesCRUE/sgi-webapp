import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'sgi-formly-wrapper-panel',
  template: `
  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title>{{ to.label }}</mat-panel-title>
    </mat-expansion-panel-header>
    <div class="formulario-dinamicos-form">
      <ng-container #fieldComponent></ng-container>
    </div>
  </mat-expansion-panel>
`,
  styles: [`
    .formulario-dinamicos-form {
      padding: 0px 0px 0px 30px;
    }
  `]
})
export class PanelWrapperComponent extends FieldWrapper {


}