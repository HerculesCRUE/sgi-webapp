import { Component, Input, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'sgi-footer-crear',
  templateUrl: './footer-crear.component.html',
  styleUrls: ['./footer-crear.component.scss']
})
export class FooterCrearComponent implements OnInit {
  @Input() route: string | any[];
  @Input() texto: string;

  constructor(
    private readonly logger: NGXLogger,
  ) {
  }

  ngOnInit(): void {
    this.logger.debug(FooterCrearComponent.name, 'ngOnInit()', 'start');
    this.logger.debug(FooterCrearComponent.name, 'ngOnInit()', 'end');
  }

}
