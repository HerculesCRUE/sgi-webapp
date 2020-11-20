import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-inv-root',
  templateUrl: './inv-root.component.html',
  styleUrls: ['./inv-root.component.scss']
})
export class InvRootComponent implements OnInit {

  constructor(private logger: NGXLogger) {
  }

  ngOnInit(): void {
    this.logger.debug(InvRootComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(InvRootComponent.name, 'ngOnInit()', 'end');
  }

}
