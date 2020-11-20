import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-inv-inicio',
  templateUrl: './inv-inicio.component.html',
  styleUrls: ['./inv-inicio.component.scss']
})
export class InvInicioComponent implements OnInit {

  constructor(private logger: NGXLogger) {
  }

  ngOnInit(): void {
    this.logger.debug(InvInicioComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(InvInicioComponent.name, 'ngOnInit()', 'end');
  }

}
