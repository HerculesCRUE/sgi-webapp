import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable()
export class AppMatPaginatorIntl extends MatPaginatorIntl {
  private ofLabel = 'of';

  constructor(private readonly translate: TranslateService) {
    super();
    this.load();
    translate.onLangChange.subscribe(() => {
      this.load();
      this.changes.next();
    });

    this.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 ${this.ofLabel} ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} ${this.ofLabel} ${length}`;
    };
  }

  private load(): void {
    this.translate.get(
      'paginator.itemsPerPageLabel'
    ).subscribe((value) => this.itemsPerPageLabel = value);
    this.translate.get(
      'paginator.nextPageLabel'
    ).subscribe((value) => this.nextPageLabel = value);
    this.translate.get(
      'paginator.previousPageLabel'
    ).subscribe((value) => this.previousPageLabel = value);
    this.translate.get(
      'paginator.firstPageLabel'
    ).subscribe((value) => this.firstPageLabel = value);
    this.translate.get(
      'paginator.lastPageLabel'
    ).subscribe((value) => this.lastPageLabel = value);
    this.translate.get(
      'paginator.of'
    ).subscribe((value) => this.ofLabel = value);
  }
}
