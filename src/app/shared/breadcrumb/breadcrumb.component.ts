import { Component, OnDestroy, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { LayoutService, BreadcrumbData } from '@core/services/layout.service';

@Component({
  selector: 'sgi-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  data: BreadcrumbData[];
  title: string;
  constructor(
    private readonly logger: NGXLogger,
    private layoutService: LayoutService
  ) { }

  ngOnInit(): void {
    this.logger.debug(BreadcrumbComponent.name, 'ngOnInit()', 'start');
    this.subscriptions.push(this.layoutService.breadcrumData$.subscribe((data) => this.data = data));
    this.subscriptions.push(this.layoutService.title$.subscribe((title) => this.title = title));
    this.logger.debug(BreadcrumbComponent.name, 'ngOnInit()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(BreadcrumbComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.logger.debug(BreadcrumbComponent.name, 'ngOnDestroy()', 'end');
  }

}
