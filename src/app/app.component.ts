import { Component, OnDestroy, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { environment } from '@env';
import { ConfigService } from '@core/services/config.service';

@Component({
  selector: 'sgi-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private logger: NGXLogger, private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.logger.info('SGI WEBAPP - HERCULES');
    this.logger.debug(AppComponent.name, 'ngOnInit()', 'start');
    this.logger.info('sgi-webapp - ' + environment.version + ' - ' + this.configService.getConfig()['build.time']);
    this.logger.debug(AppComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(AppComponent.name, 'ngOnDestroy()', 'start');
    this.logger.debug(AppComponent.name, 'ngOnDestroy()', 'end');
  }
}
