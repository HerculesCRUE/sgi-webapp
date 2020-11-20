import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-csp-inicio',
  templateUrl: './csp-inicio.component.html',
  styleUrls: ['./csp-inicio.component.scss']
})
export class CspInicioComponent implements OnInit {

  constructor(private logger: NGXLogger) {
  }

  ngOnInit(): void {
    this.logger.debug(CspInicioComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(CspInicioComponent.name, 'ngOnInit()', 'end');
  }

}
