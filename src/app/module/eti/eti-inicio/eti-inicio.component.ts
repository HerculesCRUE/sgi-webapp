import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-eti-inicio',
  templateUrl: './eti-inicio.component.html',
  styleUrls: ['./eti-inicio.component.scss']
})
export class EtiInicioComponent implements OnInit {

  constructor(private logger: NGXLogger) {
  }

  ngOnInit(): void {
    this.logger.debug(EtiInicioComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(EtiInicioComponent.name, 'ngOnInit()', 'end');
  }

}
