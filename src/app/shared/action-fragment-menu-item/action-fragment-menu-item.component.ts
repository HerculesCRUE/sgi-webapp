import { Component, Input, ViewEncapsulation } from '@angular/core';
import { IFragment } from '@core/services/action-service';

@Component({
  selector: 'sgi-action-fragment-menu-item',
  templateUrl: './action-fragment-menu-item.component.html',
  styleUrls: ['./action-fragment-menu-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ActionFragmentMenuItemComponent {
  @Input() fragment: IFragment;
  @Input() route: string | string[];
  @Input() title: string;

  constructor() { }


}
