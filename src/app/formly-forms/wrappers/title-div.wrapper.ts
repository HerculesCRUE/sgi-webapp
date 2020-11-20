import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'sgi-formly-title-div-wrapper',
  template: `
  <div [ngClass]="field.className">
    <div class="title">
      <span>{{ to.label }}</span>
    </div>
      <div class="formulario-dinamicos-form">
        <ng-container #fieldComponent></ng-container>
      </div>
  </div>
`,
  styles: [`
    .title {
      margin-bottom: 15px;
      font-size: 14px;
      font-weight: 400;
    }
    .formulario-dinamicos-form {
      padding: 0px 0px 0px 30px;
    }
  `]
})
export class TitleDivWrapperComponent extends FieldWrapper {

}