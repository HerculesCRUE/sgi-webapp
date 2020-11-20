import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-eti-root',
  templateUrl: './eti-root.component.html',
  styleUrls: ['./eti-root.component.scss']
})
export class EtiRootComponent implements OnInit {

  constructor(private logger: NGXLogger) {
  }

  ngOnInit(): void {
    this.logger.debug(EtiRootComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(EtiRootComponent.name, 'ngOnInit()', 'end');
  }

}
