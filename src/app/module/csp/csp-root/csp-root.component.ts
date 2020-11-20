import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-csp-root',
  templateUrl: './csp-root.component.html',
  styleUrls: ['./csp-root.component.scss']
})
export class CspRootComponent implements OnInit {

  constructor(private logger: NGXLogger) {
  }

  ngOnInit(): void {
    this.logger.debug(CspRootComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(CspRootComponent.name, 'ngOnInit()', 'end');
  }

}
