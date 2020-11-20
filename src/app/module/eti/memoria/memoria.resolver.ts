import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IMemoria } from '@core/models/eti/memoria';
import { MemoriaService } from '@core/services/eti/memoria.service';


const MSG_NOT_FOUND = marker('eti.memoria.not-found');

@Injectable()
export class MemoriaResolver extends SgiResolverResolver<IMemoria> {

  constructor(router: Router, snackBar: SnackBarService, private service: MemoriaService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IMemoria> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
