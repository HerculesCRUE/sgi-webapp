import { Injectable } from '@angular/core';
import { Module } from '@core/module';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';
import { Navigation, NavigationService } from './navigation.service';

export interface BreadcrumbData {
  title: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  activeModule$ = new BehaviorSubject<Module>(undefined);
  menuOpened$ = new BehaviorSubject<boolean>(true);
  menuAutoclose$ = new BehaviorSubject<boolean>(false);
  breadcrumData$ = new BehaviorSubject<BreadcrumbData[]>([]);
  title$ = new BehaviorSubject<string>('');

  constructor(protected logger: NGXLogger, private navigationService: NavigationService) {
    this.logger.debug(LayoutService.name, 'constructor(protected logger: NGXLogger)', 'start');
    this.navigationService.navigation$.subscribe((navigationStack) => {
      if (navigationStack.length > 0) {
        this.parseNavigationStack(navigationStack);
      }
    });
    this.logger.debug(LayoutService.name, 'constructor(protected logger: NGXLogger)', 'end');
  }

  private parseNavigationStack(navigationStack: Navigation[]): void {
    // Build breadcrumb data
    const breadcrumbData = this.getBreadcrumbData(navigationStack);

    // Publis new active module
    this.activeModule$.next(this.getActiveModule(navigationStack));

    // Publish new breadcrumb data
    this.breadcrumData$.next(breadcrumbData);

    // Publis new title
    this.title$.next(this.getTitle(navigationStack));

    if (breadcrumbData.length > 1) {
      this.menuAutoclose$.next(true);
      this.closeMenu();
    }
    else {
      this.menuAutoclose$.next(false);
      this.openMenu();
    }
  }

  private getBreadcrumbData(navigationStack: Navigation[]): BreadcrumbData[] {
    const data: BreadcrumbData[] = [];
    const urlStack: string[] = [];

    // The last navigation is discarded every time
    let endPositionsToDiscard = 1;
    // Check reverse navigation to discard nested empty end paths or paths without a title defined
    let p = navigationStack.length - 1;
    while (p > 0 && (navigationStack[p].segments.length < 1 || !navigationStack[p]?.routeConfig?.data?.title)) {
      endPositionsToDiscard++;
      p--;
    }

    for (let i = 0; i < navigationStack.length - endPositionsToDiscard; i++) {
      const navigation = navigationStack[i];
      if (navigation.segments && navigation.segments.length > 0) {
        urlStack.push(...navigation.segments.map((s) => s.path));
        data.push({
          // If no title defined por navigation, find the nearest right title
          title: navigation.routeConfig?.data?.title ? navigation.routeConfig.data.title : this.getNearestTitle(navigationStack.slice(i)),
          path: '/' + urlStack.join('/')
        });
      }
    }
    return data;
  }

  private getNearestTitle(navigations: Navigation[]): string {
    const nav = navigations.find((n) => n.routeConfig?.data?.title);
    return nav?.routeConfig?.data?.title;
  }

  private getActiveModule(navigationStack: Navigation[]): Module {
    const path = navigationStack.find((nav) => nav.segments.length > 0)?.routeConfig?.path;
    return Module.fromPath(path);
  }

  private getTitle(navigationStack: Navigation[]): string {
    if (navigationStack.length === 0) {
      return undefined;
    }
    let endPositionsToDiscard = 0;
    // Check reverse navigation to discard nested paths without a title defined
    let p = navigationStack.length - 1;
    while (p > 0 && (!navigationStack[p]?.routeConfig?.data?.title)) {
      endPositionsToDiscard++;
      p--;
    }
    return navigationStack[navigationStack.length - endPositionsToDiscard - 1].routeConfig?.data?.title;
  }

  openMenu(): void {
    this.menuOpened$.next(true);
  }

  closeMenu(): void {
    this.menuOpened$.next(false);
  }

  toggleMenu(): void {
    this.menuOpened$.next(!this.menuOpened$.value);
  }
}
